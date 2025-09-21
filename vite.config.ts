import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { buildConfig, getAssetFileName, productionOptimizations, developmentOptimizations } from './build.config';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  
  return {
    plugins: [react()],
    
    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    
    // Optimize dependencies for faster builds
    optimizeDeps: {
      exclude: ['lucide-react'],
      include: [
        'react',
        'react-dom',
        'papaparse',
        'jspdf',
        'html2pdf.js',
        '@supabase/supabase-js'
      ]
    },
    
    build: {
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
      minify: isProduction ? 'terser' : false,
      
      // Enhanced Terser configuration for better compression
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          pure_funcs: isProduction ? ['console.log', 'console.info', 'console.debug'] : [],
          passes: 2,
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false,
        },
      },
      
      // Advanced code splitting and chunking strategy
      rollupOptions: {
        output: {
          // Optimized file naming for better caching
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: getAssetFileName,
        },
        
        // Tree-shaking optimizations
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },
      
      // Build optimizations using config
      chunkSizeWarningLimit: buildConfig.chunks.maxSize / 1000, // Convert to KB
      sourcemap: isProduction ? productionOptimizations.sourcemap : developmentOptimizations.sourcemap,
      reportCompressedSize: false, // Disable for faster builds
      
      // Asset optimization
      assetsInlineLimit: buildConfig.assets.inlineLimit,
      
      // CSS code splitting
      cssCodeSplit: true,
      cssMinify: isProduction ? buildConfig.assets.cssMinification : false,
    },
    
    // Enhanced esbuild configuration
    esbuild: {
      drop: isProduction 
        ? (productionOptimizations.dropConsole ? ['console', 'debugger'] : ['debugger'])
        : [],
      legalComments: 'none',
      target: 'es2020',
    },
    
    server: {
      host: true,
      port: 5173,
      open: !isProduction,
      cors: true,
    },
    
    preview: {
      host: true,
      port: 4173,
      open: true,
    },
    
    // Environment variable handling
    envPrefix: 'VITE_',
  };
});