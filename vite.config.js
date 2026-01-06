import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // tailwindcss(), // Bolt might assume @tailwindcss/vite, checking package.json...
    // package.json has "@tailwindcss/postcss" and "tailwindcss": "^4.1.18"
    // For v4 with PostCSS, we don't strictly need the vite plugin if using postcss.config.js
    // But let's check if the user had it. 
    // Wait, the user deleted it. I will provide a standard React Vite config.
  ],
  server: {
    host: true, // Listen on all addresses
    port: 5173,
  },
});
