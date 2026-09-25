import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { createApiHandler } from './server/app.js';
export default defineConfig(({ mode }) => ({
  plugins: [react(), {
    name: 'filhas-api-local',
    configureServer(server) {
      const handler = createApiHandler({ env: { ...loadEnv(mode, process.cwd(), ''), ...process.env } });
      server.middlewares.use((req, res, next) => req.url?.startsWith('/api/') ? handler(req, res) : next());
    }
  }],
  build: { rollupOptions: { output: { manualChunks: { motion: ['framer-motion'], supabase: ['@supabase/supabase-js'] } } } }
}));
