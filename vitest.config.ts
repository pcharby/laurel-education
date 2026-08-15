import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // 'node', not 'jsdom': the current suite is pure logic + mocked Firestore
      // calls, no component rendering. jsdom's bundled undici currently breaks
      // under Node 22+ (see https://github.com/jsdom/jsdom/issues/3701) - switch
      // this to 'jsdom' (or happy-dom) if/when component-rendering tests are added.
      environment: 'node',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      // Vitest's own defaults, plus .claude/**: it holds isolated worktrees
      // for background agent sessions (e.g. a Claude Code subagent's own
      // branch checkout), which have their own test suites and dependencies
      // that don't belong to this project's run - picking them up here
      // causes spurious failures unrelated to this codebase.
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/cypress/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/.claude/**',
      ],
    },
  })
)
