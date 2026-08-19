import { defineConfig } from 'vite'
import path from 'path'
import { execSync } from 'child_process'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Stamped into every build so bug reports can say exactly which deploy
// they came from. Falls back gracefully outside a git checkout (e.g. a
// packaged CI artifact with no .git directory).
const commitSha = (() => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
})()

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registered manually in src/registerSW.ts instead - the default
      // auto-injected registration activates a new service worker in the
      // background but never reloads pages that are already open, so a
      // returning visitor can silently run stale JS for an entire session
      // after a deploy. The manual registration reloads once a new version
      // is ready instead.
      injectRegister: false,
      // Service worker only in real builds - a dev-mode SW just adds a
      // stale-cache footgun with no benefit while iterating.
      devOptions: { enabled: false },
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Laurel Education',
        short_name: 'Laurel',
        description: 'Observation Intelligence for Human Development',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#1A1A40',
        theme_color: '#1A1A40',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/maskable-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache the built app shell only - Firestore/Auth calls always
        // go to the network, never through the service worker. This is an
        // "opens instantly, works offline for the shell" PWA, not an
        // offline-data-editing one.
        globPatterns: ['**/*.{js,css,html,png,svg,woff,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  define: {
    __APP_VERSION__: JSON.stringify(commitSha),
  },
})
