/**
 * Primitive shell command definitions used by the lect-effect CLI.
 * Each command is intentionally kept as a single shell string so higher-level
 * composition can orchestrate ordering without bundling behavior here.
 * @since 0.1.0
 */
import { Option } from 'effect';

/**
 * Structured shell command used by higher-level CLI flows.
 * @since 0.1.0
 * @category ShellCommand
 */
export type ShellCommand = {
  readonly name: string;
  readonly command: string;
};

/** Git add all tracked/untracked files.
 * @since 0.1.0
 * @category ShellCommand
 */
export const gitAddAll: ShellCommand = { name: 'gitAddAll', command: 'git add .' };
/** Git commit with the fixed "iterate" message.
 * @since 0.1.0
 * @category ShellCommand
 */
export const gitCommitIterate: ShellCommand = { name: 'gitCommitIterate', command: 'git commit -m "iterate"' };
/** Git push HEAD to origin with upstream tracking.
 * @since 0.1.0
 * @category ShellCommand
 */
export const gitPushHead: ShellCommand = { name: 'gitPushHead', command: 'git push -u origin HEAD' };
/** Ordered steps for the iterate workflow.
 * @since 0.1.0
 * @category ShellCommand
 */
export const gitIterateSteps: readonly ShellCommand[] = [gitAddAll, gitCommitIterate, gitPushHead];

/** Archive the current HEAD to archive.zip.
 * @since 0.1.0
 * @category ShellCommand
 */
export const gitArchiveHead: ShellCommand = { name: 'gitArchiveHead', command: 'git archive --format=zip HEAD -o archive.zip' };

/** Create a new branch under the lect-effect/ prefix.
 * @since 0.1.0
 * @category ShellCommand
 */
export const gitCreateBranch = (branchName: string): ShellCommand => ({
  name: 'gitCreateBranch',
  command: `git checkout -b lect-effect/${branchName}`,
});

/** Bump the workspace version across all packages and tag the commit.
 * Assumes a clean working tree and a shared version for all packages.
 * @since 0.1.0
 * @category ShellCommand
 */
export const gitVersionSet = (version: string): ShellCommand => ({
  name: 'gitVersionSet',
  command: [
    // bump every workspace package.json version field
    `pnpm -r exec npm pkg set version=${version}`,
    // bump the workspace root package.json too
    `pnpm --workspace-root exec npm pkg set version=${version}`,
    'pnpm install --lockfile-only',
    'git add package.json pnpm-lock.yaml apps/*/package.json packages/*/package.json docs/package.json apps/migrations/package.json',
    `git commit -m "chore: release v${version}"`,
    `git tag v${version}`,
  ].join(' && '),
});

/** Show the full SHA for a given tag.
 * @since 0.1.0
 */
export const gitTagSha = (tag: string): ShellCommand => ({
  name: 'gitTagSha',
  command: `git rev-parse ${tag}`,
});

/** Show details for a given tag (commit, diff).
 * @since 0.1.0
 */
export const gitTagShow = (tag: string): ShellCommand => ({
  name: 'gitTagShow',
  command: `git show ${tag}`,
});

/** List all tags lexicographically (default refname sort).
 * @since 0.1.0
 */
export const gitTagsListLex: ShellCommand = {
  name: 'gitTagsListLex',
  command: 'git tag --list --sort=refname',
};

/** List all tags with semver-friendly ordering (version sort).
 * @since 0.1.0
 */
export const gitTagsListSemver: ShellCommand = {
  name: 'gitTagsListSemver',
  command: 'git tag --list \'v*\' --sort=version:refname',
};

/** List branches containing a tag's commit.
 * @since 0.1.0
 */
export const gitBranchesContainingTag = (tag: string): ShellCommand => ({
  name: 'gitBranchesContainingTag',
  command: `git branch -a --contains ${tag}`,
});

/** Delete a tag locally.
 * @since 0.1.0
 */
export const gitTagDeleteLocal = (tag: string): ShellCommand => ({
  name: 'gitTagDeleteLocal',
  command: `git tag -d ${tag}`,
});

/** Delete a tag from origin.
 * @since 0.1.0
 */
export const gitTagDeleteRemote = (tag: string): ShellCommand => ({
  name: 'gitTagDeleteRemote',
  command: `git push origin :refs/tags/${tag}`,
});

/** List branches sorted by last commit date.
 * @since 0.1.0
 * @category ShellCommand
 */
export const gitListBranchesByDate: ShellCommand = {
  name: 'gitListBranchesByDate',
  command: 'git for-each-ref --sort=-committerdate --format="%(committerdate:iso8601) %(refname:short)" refs/heads',
};

/** Install all workspace dependencies with frozen lockfile.
 * @since 0.1.0
 * @category ShellCommand
 */
export const installWorkspace: ShellCommand = { name: 'installWorkspace', command: 'pnpm install --recursive' };

/** Clean domain package artifacts.
 * @since 0.1.0
 * @category ShellCommand
 */
export const cleanDomain: ShellCommand = { name: 'cleanDomain', command: 'pnpm -C packages/domain clean' };
/** Clean services package artifacts.
 * @since 0.1.0
 * @category ShellCommand
 */
export const cleanServices: ShellCommand = { name: 'cleanServices', command: 'pnpm -C packages/services clean' };
/** Clean handlers package artifacts.
 * @since 0.1.0
 * @category ShellCommand
 */
export const cleanHandlers: ShellCommand = { name: 'cleanHandlers', command: 'pnpm -C packages/handlers clean' };
/** Clean backend app artifacts.
 * @since 0.1.0
 * @category ShellCommand
 */
export const cleanBackend: ShellCommand = { name: 'cleanBackend', command: 'pnpm -C apps/backend clean' };
/** Clean GraphQL schema package artifacts.
 * @since 0.1.0
 * @category ShellCommand
 */
export const cleanGraphqlSchema: ShellCommand = { name: 'cleanGraphqlSchema', command: 'pnpm -C packages/graphql-schema clean' };
/** Clean frontend app artifacts.
 * @since 0.1.0
 * @category ShellCommand
 */
export const cleanFrontend: ShellCommand = { name: 'cleanFrontend', command: 'pnpm -C apps/frontend clean' };
/** Clean docs build artifacts.
 * @since 0.1.0
 * @category ShellCommand
 */
export const cleanDocs: ShellCommand = { name: 'cleanDocs', command: 'pnpm -C docs clean' };

/** Build domain package.
 * @since 0.1.0
 * @category ShellCommand
 */
export const buildDomain: ShellCommand = { name: 'buildDomain', command: 'pnpm -C packages/domain build' };
/** Build services package.
 * @since 0.1.0
 * @category ShellCommand
 */
export const buildServices: ShellCommand = { name: 'buildServices', command: 'pnpm -C packages/services build' };
/** Build handlers package.
 * @since 0.1.0
 * @category ShellCommand
 */
export const buildHandlers: ShellCommand = { name: 'buildHandlers', command: 'pnpm -C packages/handlers build' };
/** Build backend app.
 * @since 0.1.0
 * @category ShellCommand
 */
export const buildBackend: ShellCommand = { name: 'buildBackend', command: 'pnpm -C apps/backend build' };
/** Build GraphQL schema package.
 * @since 0.1.0
 * @category ShellCommand
 */
export const buildGraphqlSchema: ShellCommand = { name: 'buildGraphqlSchema', command: 'pnpm -C packages/graphql-schema build' };
/** Generate GraphQL schema artifacts.
 * @since 0.1.0
 * @category ShellCommand
 */
export const generateGraphqlSchema: ShellCommand = { name: 'generateGraphqlSchema', command: 'pnpm -C packages/graphql-schema schema:generate' };
/** Run frontend GraphQL codegen.
 * @since 0.1.0
 * @category ShellCommand
 */
export const frontendCodegen: ShellCommand = { name: 'frontendCodegen', command: 'pnpm -C apps/frontend run graphql:codegen' };
/** Build frontend app.
 * @since 0.1.0
 * @category ShellCommand
 */
export const buildFrontend: ShellCommand = { name: 'buildFrontend', command: 'pnpm -C apps/frontend build' };
/** Build docs site.
 * @since 0.1.0
 * @category ShellCommand
 */
export const buildDocs: ShellCommand = { name: 'buildDocs', command: 'pnpm -C docs build' };

/** Run main DB migrations against MASTERDATA_PG_URL.
 * @since 0.1.0
 * @category ShellCommand
 */
export const migrateMasterdataUp: ShellCommand = { name: 'migrateMasterdataUp', command: 'pnpm -C apps/migrations migrate:masterdata:up' };
/** Run test DB migrations against TEST_MASTERDATA_PG_URL.
 * @since 0.1.0
 * @category ShellCommand
 */
export const migrateTestMasterdataUp: ShellCommand = { name: 'migrateTestMasterdataUp', command: 'pnpm -C apps/migrations migrate:test-masterdata:up' };

/** Start backend runtime.
 * @since 0.1.0
 * @category ShellCommand
 */
export const startBackendRuntime: ShellCommand = { name: 'startBackendRuntime', command: 'pnpm -C apps/backend start' };
/** Start frontend runtime.
 * @since 0.1.0
 * @category ShellCommand
 */
export const startFrontendRuntime: ShellCommand = { name: 'startFrontendRuntime', command: 'pnpm -C apps/frontend start' };
/** Start backend and frontend concurrently with labeled output.
 * @since 0.1.0
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
 * @since 0.1.0
 * @category ShellCommand
 */
export const docsPruneContent: ShellCommand = {
  name: 'docsPruneContent',
  command: 'rm -rf docs/src/content/docs/{backend,cli,frontend,domain,services,handlers,graphql-schema}/modules',
};
/** Generate docs for all packages from the docs workspace.
 * @since 0.1.0
 * @category ShellCommand
 */
export const docsGenerateContentSteps: readonly ShellCommand[] = [
  { name: 'docsGenerateAll', command: 'pnpm -C docs run docs:generate' },
];
/** Start the docs dev server.
 * @since 0.1.0
 * @category ShellCommand
 */
export const docsDev: ShellCommand = { name: 'docsDev', command: 'pnpm -C docs dev' };

/** Workspace lint command with optional --fix flag.
 * @since 0.1.0
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
 * @since 0.1.0
 * @category ShellCommand
 */
export const testWorkspace: ShellCommand = {
  name: 'testWorkspace',
  command: 'pnpm -C packages/domain test && pnpm -C apps/backend test && pnpm -C apps/frontend test',
};

/** Ordered clean steps across all workspaces.
 * @since 0.1.0
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
 * @since 0.1.0
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
