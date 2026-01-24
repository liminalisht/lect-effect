import { Option } from 'effect';

export type ShellCommand = {
  readonly name: string;
  readonly command: string;
};

export const gitAddAll: ShellCommand = { name: 'gitAddAll', command: 'git add .' };
export const gitCommitIterate: ShellCommand = { name: 'gitCommitIterate', command: 'git commit -m "iterate"' };
export const gitPushHead: ShellCommand = { name: 'gitPushHead', command: 'git push -u origin HEAD' };
export const gitIterateSteps: readonly ShellCommand[] = [gitAddAll, gitCommitIterate, gitPushHead];

export const gitArchiveHead: ShellCommand = { name: 'gitArchiveHead', command: 'git archive --format=zip HEAD -o archive.zip' };

export const installWorkspace: ShellCommand = { name: 'installWorkspace', command: 'pnpm install --frozen-lockfile --recursive' };

export const cleanDomain: ShellCommand = { name: 'cleanDomain', command: 'pnpm -C packages/domain clean' };
export const cleanBackend: ShellCommand = { name: 'cleanBackend', command: 'pnpm -C apps/backend clean' };
export const cleanGraphqlSchema: ShellCommand = { name: 'cleanGraphqlSchema', command: 'pnpm -C packages/graphql-schema clean' };
export const cleanFrontend: ShellCommand = { name: 'cleanFrontend', command: 'pnpm -C apps/frontend clean' };
export const cleanDocs: ShellCommand = { name: 'cleanDocs', command: 'pnpm -C docs clean' };

export const buildDomain: ShellCommand = { name: 'buildDomain', command: 'pnpm -C packages/domain build' };
export const buildBackend: ShellCommand = { name: 'buildBackend', command: 'pnpm -C apps/backend build' };
export const buildGraphqlSchema: ShellCommand = { name: 'buildGraphqlSchema', command: 'pnpm -C packages/graphql-schema build' };
export const generateGraphqlSchema: ShellCommand = { name: 'generateGraphqlSchema', command: 'pnpm -C packages/graphql-schema schema:generate' };
export const frontendCodegen: ShellCommand = { name: 'frontendCodegen', command: 'pnpm -C apps/frontend run graphql:codegen' };
export const buildFrontend: ShellCommand = { name: 'buildFrontend', command: 'pnpm -C apps/frontend build' };
export const buildDocs: ShellCommand = { name: 'buildDocs', command: 'pnpm -C docs build' };

export const migrateMasterdataUp: ShellCommand = { name: 'migrateMasterdataUp', command: 'pnpm lect-effect/migrate/masterdata:up' };
export const migrateTestMasterdataUp: ShellCommand = { name: 'migrateTestMasterdataUp', command: 'pnpm lect-effect/migrate/test-masterdata:up' };

export const startBackendRuntime: ShellCommand = { name: 'startBackendRuntime', command: 'pnpm -C apps/backend start' };
export const startFrontendRuntime: ShellCommand = { name: 'startFrontendRuntime', command: 'pnpm -C apps/frontend start' };
export const startBackendAndFrontend: ShellCommand = { name: 'startBackendAndFrontend', command: 'pnpm concurrently --names backend,frontend --prefix-colors blue,green "pnpm -C apps/backend start" "pnpm -C apps/frontend start"' };

export const docsPruneContent: ShellCommand = { name: 'docsPruneContent', command: 'rm -rf docs/src/content/docs/{backend,frontend,domain}' };
export const docsGenerateBackend: ShellCommand = { name: 'docsGenerateBackend', command: 'pnpm -C apps/backend docs:generate' };
export const docsGenerateDomain: ShellCommand = { name: 'docsGenerateDomain', command: 'pnpm -C packages/domain docs:generate' };
export const docsGenerateGraphqlSchema: ShellCommand = { name: 'docsGenerateGraphqlSchema', command: 'pnpm -C packages/graphql-schema docs:generate' };
export const docsGenerateFrontend: ShellCommand = { name: 'docsGenerateFrontend', command: 'pnpm -C apps/frontend docs:generate' };
export const docsGenerateContentSteps: readonly ShellCommand[] = [
  docsGenerateBackend,
  docsGenerateDomain,
  docsGenerateGraphqlSchema,
  docsGenerateFrontend,
];
export const docsMoveModuleIndexes: ShellCommand = {
  name: 'docsMoveModuleIndexes',
  command: [
    'for section in backend frontend domain graphql-schema; do',
    'src="docs/src/content/docs/$section/modules/index.md";',
    'dst="docs/src/content/docs/$section/modules/_index.md";',
    'if [ -f "$src" ]; then mv "$src" "$dst"; fi;',
    'done',
  ].join(' '),
};
export const docsDev: ShellCommand = { name: 'docsDev', command: 'pnpm -C docs dev' };

export const lintShellCommand = (fix: Option.Option<boolean>): ShellCommand => ({
  name: 'lintWorkspace',
  command: `pnpm lect-effect/lint${Option.match(fix, { onNone: () => '', onSome: () => ' --fix' })}`,
});

export const testWorkspace: ShellCommand = {
  name: 'testWorkspace',
  command: 'pnpm -C packages/domain test && pnpm -C apps/backend test && pnpm -C apps/frontend test',
};

export const cleanSteps: readonly ShellCommand[] = [cleanDomain, cleanBackend, cleanGraphqlSchema, cleanFrontend, cleanDocs];

export const fullBuildSteps: readonly ShellCommand[] = [
  installWorkspace,
  ...cleanSteps,
  buildDomain,
  buildBackend,
  buildGraphqlSchema,
  generateGraphqlSchema,
  frontendCodegen,
  buildFrontend,
  buildDocs,
];
