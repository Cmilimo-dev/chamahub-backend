import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'
  
  return {
    server: {
      host: "::",
      port: 3000,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      visualizer({
        filename: 'dist/stats.html',
        open: !isProd,
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: 'es2015',
      minify: isProd ? 'terser' : false,
      sourcemap: !isProd,
      cssCodeSplit: false,
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Put everything from node_modules into one vendor chunk
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          chunkFileNames: isProd ? 'assets/[name]-[hash].js' : 'assets/[name].js',
          entryFileNames: isProd ? 'assets/[name]-[hash].js' : 'assets/[name].js',
          assetFileNames: isProd ? 'assets/[name]-[hash].[ext]' : 'assets/[name].[ext]',
        },
      },
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: false,
          pure_funcs: [],
        },
        mangle: {
          safari10: true,
        },
        format: {
          safari10: true,
        },
      },
    },
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __PROD__: JSON.stringify(isProd),
    },
    preview: {
      port: 4173,
      strictPort: true,
      host: true,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@tanstack/react-query',
        'react-router-dom',
        'react-hook-form',
        'zod',
      ],
    },
  }
});
