import { filterWorkouts, paginateWorkouts, type WorkoutBrowseRecord } from './filtering';
import { loadSnapshotSet, type R2BucketLike } from './r2';

type WorkoutDetailRecord = {
  slug: string;
  [key: string]: unknown;
};

type WorkerDeps = {
  bucket: R2BucketLike;
  vectorize?: VectorizeIndex;
  ai?: Ai;
  baseKey?: string;
};

async function handleBrowse(request: Request, deps: WorkerDeps) {
  const { browse } = await loadSnapshotSet<WorkoutBrowseRecord[], Record<string, WorkoutDetailRecord>>(
    deps.bucket,
    deps.baseKey || 'workouts',
  );

  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const isSemantic = url.searchParams.has('semantic');

  let items = browse;

  if (isSemantic && q && deps.vectorize && deps.ai) {
    const embedding = await deps.ai.run('@cf/baai/bge-small-en-v1.5', { text: [q] });
    const vector = embedding.data[0];
    const matches = await deps.vectorize.query(vector, { topK: 20 });
    const matchedIds = matches.matches.map(m => m.id);
    items = matchedIds.map(id => browse.find(b => b.id === id)).filter(Boolean) as WorkoutBrowseRecord[];
  } else {
    items = filterWorkouts(browse, {
      q,
      provider: url.searchParams.get('provider') || '',
      category: url.searchParams.get('category') || '',
    });
  }

  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const pageSize = Math.max(1, Number(url.searchParams.get('pageSize') || '20'));

  return Response.json(paginateWorkouts(items, page, pageSize));
}

async function handleDetail(slug: string, deps: WorkerDeps) {
  const { detail } = await loadSnapshotSet<WorkoutBrowseRecord[], Record<string, WorkoutDetailRecord>>(
    deps.bucket,
    deps.baseKey || 'workouts',
  );

  const record = Object.values(detail).find(r => r.slug === slug);
  if (!record) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json(record);
}

async function handleBuildCatalog(deps: WorkerDeps) {
  const { detail } = await loadSnapshotSet<WorkoutBrowseRecord[], Record<string, WorkoutDetailRecord>>(
    deps.bucket,
    deps.baseKey || 'workouts',
  );

  return Response.json({ items: detail });
}

export function createWorkoutsWorker(deps: WorkerDeps) {
  return {
    async fetch(request: Request): Promise<Response> {
      const url = new URL(request.url);
      const path = url.pathname.replace(/\/+$/, '');

      if (request.method !== 'GET') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
      }

      if (path === '/api/workouts') {
        return handleBrowse(request, deps);
      }

      if (path === '/api/workouts/build') {
        return handleBuildCatalog(deps);
      }

      if (path.startsWith('/api/workouts/')) {
        const slug = path.slice('/api/workouts/'.length);
        return handleDetail(slug, deps);
      }

      return Response.json({ error: 'Not found' }, { status: 404 });
    },
  };
}

export interface Env {
  BUCKET: R2Bucket;
  VECTORIZE: VectorizeIndex;
  AI: Ai;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const worker = createWorkoutsWorker({
      bucket: env.BUCKET as any,
      vectorize: env.VECTORIZE,
      ai: env.AI,
    });
    return worker.fetch(request);
  },
};
