import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildWorkoutCategoryPages,
  buildWorkoutDetailCatalog,
  type WorkoutTitleGroup,
} from "../../../src/lib/workoutsCatalog";
import {
  localizeSidebarItems,
  type SidebarLocale,
} from "../../../src/lib/workoutSidebarI18n";
import {
  loadWorkoutDetailCatalogFromSnapshot,
  localizeWorkoutCatalogDescriptions,
} from "../../../src/lib/workoutsApi";
import { renderCategoryPage, renderIndexPage } from "./workoutPageRenderer";

// ── Path constants ────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const repoRoot = path.resolve(__dirname, "../../..");

const docsRoot = (locale: SidebarLocale | "root") =>
  locale === "root"
    ? path.resolve(repoRoot, "docs")
    : path.resolve(repoRoot, `docs/${locale === "zh-CN" ? "zh-cn" : locale}`);

export const workoutsDocsRoot = (locale: SidebarLocale | "root") =>
  path.join(docsRoot(locale), "workouts");

// ── File writers ──────────────────────────────────────────────────────────────

function writeGeneratedPages(
  locale: SidebarLocale,
  root: string,
  pages: Array<{
    path: string;
    category: string;
    group: { titleGroups: WorkoutTitleGroup[] };
  }>,
  sidebar: Array<{ text: string; link: string }>,
  snapshotUpdatedAt?: string,
): void {
  fs.mkdirSync(root, { recursive: true });

  // Remove stale generated pages
  for (const entry of fs.readdirSync(root)) {
    if (entry.endsWith(".md")) {
      fs.unlinkSync(path.join(root, entry));
    }
  }

  for (const page of pages) {
    fs.writeFileSync(
      page.path,
      renderCategoryPage(
        locale,
        page.category,
        page.group.titleGroups,
        snapshotUpdatedAt,
      ),
      "utf8",
    );
  }

  fs.writeFileSync(
    path.join(root, "index.md"),
    renderIndexPage(locale, sidebar, snapshotUpdatedAt),
    "utf8",
  );
}

// ── Locale config ─────────────────────────────────────────────────────────────

type LocaleConfig = {
  locale: SidebarLocale;
  docsBasePath: string;
  routeBasePath: string;
  docsRoot: string;
  parentRoot?: string; // ensure parent dir exists before writing
};

const localeConfigs: LocaleConfig[] = [
  {
    locale: "de",
    docsBasePath: workoutsDocsRoot("de"),
    routeBasePath: "/de/workouts",
    docsRoot: workoutsDocsRoot("de"),
  },
  {
    locale: "en",
    docsBasePath: workoutsDocsRoot("en"),
    routeBasePath: "/en/workouts",
    docsRoot: workoutsDocsRoot("en"),
    parentRoot: docsRoot("en"),
  },
  {
    locale: "ja",
    docsBasePath: workoutsDocsRoot("ja"),
    routeBasePath: "/ja/workouts",
    docsRoot: workoutsDocsRoot("ja"),
    parentRoot: docsRoot("ja"),
  },
  {
    locale: "ko",
    docsBasePath: workoutsDocsRoot("ko"),
    routeBasePath: "/ko/workouts",
    docsRoot: workoutsDocsRoot("ko"),
    parentRoot: docsRoot("ko"),
  },
  {
    locale: "zh-CN",
    docsBasePath: workoutsDocsRoot("zh-CN"),
    routeBasePath: "/zh-cn/workouts",
    docsRoot: workoutsDocsRoot("zh-CN"),
    parentRoot: docsRoot("zh-CN"),
  },
];

// ── Main build function ───────────────────────────────────────────────────────

export type WorkoutSidebar = Record<
  SidebarLocale,
  Array<{ text: string; link: string }>
>;

export async function ensureWorkoutPages(): Promise<WorkoutSidebar> {
  const snapshotBaseUrl =
    process.env.WORKOUTS_SNAPSHOT_BASE_URL ??
    process.env.VITEPRESS_WORKOUTS_SNAPSHOT_BASE_URL ??
    "https://athena-public-snapshots.oili.workers.dev";

  const snapshot = await loadWorkoutDetailCatalogFromSnapshot(snapshotBaseUrl);

  const sidebars = {} as WorkoutSidebar;

  for (const cfg of localeConfigs) {
    const localizedCatalog = buildWorkoutDetailCatalog(
      localizeWorkoutCatalogDescriptions(
        snapshot.catalog,
        snapshot.descriptionMetadata,
        cfg.locale,
      ) as never,
    );
    const { pages, sidebar } = buildWorkoutCategoryPages(localizedCatalog, {
      docsBasePath: cfg.docsBasePath,
      routeBasePath: cfg.routeBasePath,
    });

    if (cfg.parentRoot) {
      fs.mkdirSync(cfg.parentRoot, { recursive: true });
    }

    writeGeneratedPages(
      cfg.locale,
      cfg.docsRoot,
      pages,
      sidebar,
      snapshot.updatedAt,
    );
    sidebars[cfg.locale] = localizeSidebarItems(cfg.locale, sidebar);
  }

  return sidebars;
}
