import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = env.PORT ? Number(env.PORT) : 5001;
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:5003/api';

  return {
    plugins: [react()],
    define: {
      __API_BASE_URL__: JSON.stringify(apiBaseUrl),
    },
    server: { port },
    preview: { port },
  };
});
