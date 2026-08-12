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
    },
  })
)
