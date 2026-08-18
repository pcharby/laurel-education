import { defineConfig } from 'vitest/config'

// Separate from vitest.config.ts on purpose: these tests need the Firestore
// and Storage emulators running (see package.json's "test:rules" script,
// which wraps this in `firebase emulators:exec`) and must never run as part
// of the plain `npm run test` unit suite, which has no emulator available.
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['test/**/*.test.ts'],
    testTimeout: 20000,
    hookTimeout: 20000,
  },
})
