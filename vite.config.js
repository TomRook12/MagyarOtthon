import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

// Stamp the build so the running app can say which commit it came from. The app has no
// service worker, so a cached index.html silently keeps serving an old hashed bundle —
// without this there is no way to tell a missing feature from a stale client.
function buildSha() {
  try { return execSync('git rev-parse --short HEAD').toString().trim(); }
  catch { return (process.env.GITHUB_SHA || 'unknown').slice(0, 7); }
}

export default defineConfig({
  plugins: [react()],
  base: '/MagyarOtthon/',
  define: {
    __BUILD_SHA__: JSON.stringify(buildSha()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
})
