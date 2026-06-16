import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = env.PORT ? Number(env.PORT) : 5001;

  return {
    plugins: [react()],
    server: { port },
    preview: { port },
  };
});
