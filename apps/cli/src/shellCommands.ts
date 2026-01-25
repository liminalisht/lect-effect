/**
 * Primitive shell command definitions used by the lect-effect CLI.
 * Each command is intentionally kept as a single shell string so higher-level
 * composition can orchestrate ordering without bundling behavior here.
 * @since 1.0.0
 */
import { Option } from 'effect';

/**
 * Structured shell command used by higher-level CLI flows.
 * @since 1.0.0
 * @category ShellCommand
 */
export type ShellCommand = {
  readonly name: string;
  readonly command: string;
};

/** Git add all tracked/untracked files.
 * @since 1.0.0
 * @category ShellCommand
 */
export const gitAddAll: ShellCommand = { name: 'gitAddAll', command: 'git add .' };
/** Git commit with the fixed "iterate" message.
 * @since 1.0.0
 * @category ShellCommand
 */
export const gitCommitIterate: ShellCommand = { name: 'gitCommitIterate', command: 'git commit -m "iterate"' };
/** Git push HEAD to origin with upstream tracking.
 * @since 1.0.0
 * @category ShellCommand
 */
export const gitPushHead: ShellCommand = { name: 'gitPushHead', command: 'git push -u origin HEAD' };
/** Ordered steps for the iterate workflow.
 * @since 1.0.0
 * @category ShellCommand
 */
export const gitIterateSteps: readonly ShellCommand[] = [gitAddAll, gitCommitIterate, gitPushHead];

/** Archive the current HEAD to archive.zip.
 * @since 1.0.0
 * @category ShellCommand
 */
export const gitArchiveHead: ShellCommand = { name: 'gitArchiveHead', command: 'git archive --format=zip HEAD -o archive.zip' };

/** Create a new branch under the lect-effect/ prefix.
 * @since 1.0.0
 * @category ShellCommand
 */
export const gitCreateBranch = (branchName: string): ShellCommand => ({
  name: 'gitCreateBranch',
  command: `git checkout -b lect-effect/${branchName}`,
});

/** List branches sorted by last commit date.
 * @since 1.0.0
 * @category ShellCommand
 */
export const gitListBranchesByDate: ShellCommand = {
  name: 'gitListBranchesByDate',
  command: 'git for-each-ref --sort=-committerdate --format="%(committerdate:iso8601) %(refname:short)" refs/heads',
};

/** Install all workspace dependencies with frozen lockfile.
 * @since 1.0.0
 * @category ShellCommand
 */
export const installWorkspace: ShellCommand = { name: 'installWorkspace', command: 'pnpm install --recursive' };

/** Clean domain package artifacts.
 * @since 1.0.0
 * @category ShellCommand
 */
export const cleanDomain: ShellCommand = { name: 'cleanDomain', command: 'pnpm -C packages/domain clean' };
/** Clean services package artifacts.
 * @since 1.0.0
 * @category ShellCommand
 */
export const cleanServices: ShellCommand = { name: 'cleanServices', command: 'pnpm -C packages/services clean' };
/** Clean handlers package artifacts.
 * @since 1.0.0
 * @category ShellCommand
 */
export const cleanHandlers: ShellCommand = { name: 'cleanHandlers', command: 'pnpm -C packages/handlers clean' };
/** Clean backend app artifacts.
 * @since 1.0.0
 * @category ShellCommand
 */
export const cleanBackend: ShellCommand = { name: 'cleanBackend', command: 'pnpm -C apps/backend clean' };
/** Clean GraphQL schema package artifacts.
 * @since 1.0.0
 * @category ShellCommand
 */
export const cleanGraphqlSchema: ShellCommand = { name: 'cleanGraphqlSchema', command: 'pnpm -C packages/graphql-schema clean' };
/** Clean frontend app artifacts.
 * @since 1.0.0
 * @category ShellCommand
 */
export const cleanFrontend: ShellCommand = { name: 'cleanFrontend', command: 'pnpm -C apps/frontend clean' };
/** Clean docs build artifacts.
 * @since 1.0.0
 * @category ShellCommand
 */
export const cleanDocs: ShellCommand = { name: 'cleanDocs', command: 'pnpm -C docs clean' };

/** Build domain package.
 * @since 1.0.0
 * @category ShellCommand
 */
export const buildDomain: ShellCommand = { name: 'buildDomain', command: 'pnpm -C packages/domain build' };
/** Build services package.
 * @since 1.0.0
 * @category ShellCommand
 */
export const buildServices: ShellCommand = { name: 'buildServices', command: 'pnpm -C packages/services build' };
/** Build handlers package.
 * @since 1.0.0
 * @category ShellCommand
 */
export const buildHandlers: ShellCommand = { name: 'buildHandlers', command: 'pnpm -C packages/handlers build' };
/** Build backend app.
 * @since 1.0.0
 * @category ShellCommand
 */
export const buildBackend: ShellCommand = { name: 'buildBackend', command: 'pnpm -C apps/backend build' };
/** Build GraphQL schema package.
 * @since 1.0.0
 * @category ShellCommand
 */
export const buildGraphqlSchema: ShellCommand = { name: 'buildGraphqlSchema', command: 'pnpm -C packages/graphql-schema build' };
/** Generate GraphQL schema artifacts.
 * @since 1.0.0
 * @category ShellCommand
 */
export const generateGraphqlSchema: ShellCommand = { name: 'generateGraphqlSchema', command: 'pnpm -C packages/graphql-schema schema:generate' };
/** Run frontend GraphQL codegen.
 * @since 1.0.0
 * @category ShellCommand
 */
export const frontendCodegen: ShellCommand = { name: 'frontendCodegen', command: 'pnpm -C apps/frontend run graphql:codegen' };
/** Build frontend app.
 * @since 1.0.0
 * @category ShellCommand
 */
export const buildFrontend: ShellCommand = { name: 'buildFrontend', command: 'pnpm -C apps/frontend build' };
/** Build docs site.
 * @since 1.0.0
 * @category ShellCommand
 */
export const buildDocs: ShellCommand = { name: 'buildDocs', command: 'pnpm -C docs build' };

/** Run main DB migrations against MASTERDATA_PG_URL.
 * @since 1.0.0
 * @category ShellCommand
 */
export const migrateMasterdataUp: ShellCommand = { name: 'migrateMasterdataUp', command: 'pnpm -C apps/migrations migrate:masterdata:up' };
/** Run test DB migrations against TEST_MASTERDATA_PG_URL.
 * @since 1.0.0
 * @category ShellCommand
 */
export const migrateTestMasterdataUp: ShellCommand = { name: 'migrateTestMasterdataUp', command: 'pnpm -C apps/migrations migrate:test-masterdata:up' };

/** Start backend runtime.
 * @since 1.0.0
 * @category ShellCommand
 */
export const startBackendRuntime: ShellCommand = { name: 'startBackendRuntime', command: 'pnpm -C apps/backend start' };
/** Start frontend runtime.
 * @since 1.0.0
 * @category ShellCommand
 */
export const startFrontendRuntime: ShellCommand = { name: 'startFrontendRuntime', command: 'pnpm -C apps/frontend start' };
/** Start backend and frontend concurrently with labeled output.
 * @since 1.0.0
 * @category ShellCommand
 */
export const startBackendAndFrontend: ShellCommand = {
  name: 'startBackendAndFrontend',
  command: [
    // Run concurrently via the CLI package dependency; use --dir to target roots from apps/cli
    'pnpm --filter @lect-effect/cli exec concurrently',
    '--names backend,frontend',
    '--prefix-colors blue,green',
    '"pnpm --dir ../../apps/backend start"',
    '"pnpm --dir ../../apps/frontend start"',
  ].join(' '),
};

/** Remove generated docs content before regeneration.
 * @since 1.0.0
 * @category ShellCommand
 */
export const docsPruneContent: ShellCommand = {
  name: 'docsPruneContent',
  command: 'rm -rf docs/src/content/docs/{backend,cli,frontend,domain,graphql-schema}',
};
/** Generate backend docs content.
 * @since 1.0.0
 * @category ShellCommand
 */
export const docsGenerateBackend: ShellCommand = { name: 'docsGenerateBackend', command: 'pnpm -C apps/backend docs:generate' };
/** Generate domain docs content.
 * @since 1.0.0
 * @category ShellCommand
 */
export const docsGenerateDomain: ShellCommand = { name: 'docsGenerateDomain', command: 'pnpm -C packages/domain docs:generate' };
/** Generate GraphQL schema docs content.
 * @since 1.0.0
 * @category ShellCommand
 */
export const docsGenerateGraphqlSchema: ShellCommand = { name: 'docsGenerateGraphqlSchema', command: 'pnpm -C packages/graphql-schema docs:generate' };
/** Generate frontend docs content.
 * @since 1.0.0
 * @category ShellCommand
 */
export const docsGenerateFrontend: ShellCommand = { name: 'docsGenerateFrontend', command: 'pnpm -C apps/frontend docs:generate' };
/** Generate CLI docs content.
 * @since 1.0.0
 * @category ShellCommand
 */
export const docsGenerateCLI: ShellCommand = { name: 'docsGenerateCLI', command: 'pnpm -C apps/cli docs:generate' };
/** Ordered steps to regenerate docs content across packages.
 * @since 1.0.0
 * @category ShellCommand
 */
export const docsGenerateContentSteps: readonly ShellCommand[] = [
  docsGenerateBackend,
  docsGenerateDomain,
  docsGenerateGraphqlSchema,
  docsGenerateFrontend,
  docsGenerateCLI,
];
/** Move module indexes to _index.md for Starlight routing expectations.
 * @since 1.0.0
 * @category ShellCommand
 */
export const docsMoveModuleIndexes: ShellCommand = {
  name: 'docsMoveModuleIndexes',
  command: [
    'for section in backend frontend domain graphql-schema cli; do',
    'src="docs/src/content/docs/$section/modules/index.md";',
    'dst="docs/src/content/docs/$section/modules/_index.md";',
    'if [ -f "$src" ]; then mv "$src" "$dst"; fi;',
    'done',
  ].join(' '),
};
/** Start the docs dev server.
 * @since 1.0.0
 * @category ShellCommand
 */
export const docsDev: ShellCommand = { name: 'docsDev', command: 'pnpm -C docs dev' };

/** Workspace lint command with optional --fix flag.
 * @since 1.0.0
 * @category ShellCommand
 */
export const lintShellCommand = (fix: Option.Option<boolean>): ShellCommand => ({
  name: 'lintWorkspace',
  command: [
    'pnpx xo --ignore "docs-site/**" --ignore "apps/frontend/src/graphql/generated/**"',
    Option.match(fix, {
      onNone: () => '',
      onSome: value => (value ? ' --fix' : ''),
    }),
  ].join(''),
});

/** Run test suites for domain, backend, and frontend.
 * @since 1.0.0
 * @category ShellCommand
 */
export const testWorkspace: ShellCommand = {
  name: 'testWorkspace',
  command: 'pnpm -C packages/domain test && pnpm -C apps/backend test && pnpm -C apps/frontend test',
};

/** Ordered clean steps across all workspaces.
 * @since 1.0.0
 * @category ShellCommand[]
 */
export const cleanSteps: readonly ShellCommand[] = [
  cleanDomain,
  cleanServices,
  cleanHandlers,
  cleanBackend,
  cleanGraphqlSchema,
  cleanFrontend,
  cleanDocs,
];

/** Full build pipeline in dependency order.
 * @since 1.0.0
 * @category ShellCommand[]
 */
export const fullBuildSteps: readonly ShellCommand[] = [
  installWorkspace,
  ...cleanSteps,
  buildDomain,
  buildServices,
  buildHandlers,
  buildBackend,
  buildGraphqlSchema,
  generateGraphqlSchema,
  frontendCodegen,
  buildFrontend,
  buildDocs,
];
