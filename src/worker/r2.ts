export type ManifestSnapshot = {
  version: string;
  generatedAt: string;
  browseKey: string;
  detailKey: string;
  itemCount: number;
};

export type R2BucketLike = {
  get(key: string): Promise<{ text(): Promise<string> } | null>;
};

export async function readJson<T>(bucket: R2BucketLike, key: string): Promise<T> {
  const obj = await bucket.get(key);
  if (!obj) {
    throw new Error(`Missing R2 object: ${key}`);
  }
  const raw = await obj.text();
  return JSON.parse(raw) as T;
}

export async function loadSnapshotSet<TBrowse, TDetail>(bucket: R2BucketLike, baseKey: string) {
  const manifest = await readJson<ManifestSnapshot>(bucket, `${baseKey}/manifest.json`);
  const browse = await readJson<TBrowse>(bucket, manifest.browseKey);
  const detail = await readJson<TDetail>(bucket, manifest.detailKey);

  return { manifest, browse, detail };
}
