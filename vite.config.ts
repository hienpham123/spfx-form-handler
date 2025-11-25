import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',
  resolve: {
    alias: {
      '@': './src',
    },
  },
  server: {
    port: 3001,
    open: true,
    // ✅ Proxy để forward requests đến SharePoint - giúp cookies được share
    // Giống như Create React App proxy, Vite proxy sẽ forward requests và giữ cookies
    proxy: {
      // ✅ Proxy cho tất cả SharePoint API paths - giống Create React App
      // Create React App tự động proxy tất cả requests không match static files
      // Vite cần config từng path cụ thể
      '/_api': {
        target: 'https://buildcorp.sharepoint.com',
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: '',
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            if (proxyRes.headers['set-cookie']) {
              const cookies = Array.isArray(proxyRes.headers['set-cookie']) 
                ? proxyRes.headers['set-cookie'] 
                : [proxyRes.headers['set-cookie']];
              proxyRes.headers['set-cookie'] = cookies.map((cookie: string) => {
                return cookie.replace(/;\s*domain=[^;]+/gi, '');
              });
            }
          });
        },
      },
      // ✅ Proxy cho tất cả SharePoint site paths
      '/sites': {
        target: 'https://buildcorp.sharepoint.com',
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: '',
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            if (proxyRes.headers['set-cookie']) {
              const cookies = Array.isArray(proxyRes.headers['set-cookie']) 
                ? proxyRes.headers['set-cookie'] 
                : [proxyRes.headers['set-cookie']];
              proxyRes.headers['set-cookie'] = cookies.map((cookie: string) => {
                return cookie.replace(/;\s*domain=[^;]+/gi, '');
              });
            }
          });
        },
      },
    },
  },
})

