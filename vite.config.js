import { defineConfig } from 'vite'
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
const path = require("path");
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      'node-fetch': 'isomorphic-fetch',
      vue: '@vue/compat'
    },
  },
    plugins: [vue({
    template: {
      compilerOptions: {
        compatConfig: {
          MODE: 2
        }
      }
    }
  })],
});