import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The Netlify Functions (chat, contact, feedback …) stay in FrontPage/netlify and
// are not run locally. In dev, forward those calls to the live site so the chat
// and the testimonials work while the world is being built.
// Careful: the contact form reaches the REAL Telegram bot through this proxy.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
    proxy: {
      '/.netlify/functions': {
        target: 'https://gengashvili-luka.space',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
