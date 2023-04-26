import { defineConfig } from 'vite'
import { createVuePlugin as vue } from "vite-plugin-vue2";

// https://vitejs.dev/config/
const path = require("path");
export default defineConfig({
  plugins: [vue({
    template: {
      compilerOptions: {
        compatConfig: {
          MODE: 2
        }
      }
    }
  })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      'node-fetch': 'isomorphic-fetch',
      'vue': '@vue/compat'
    },
  },
});