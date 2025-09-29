import { defineConfig } from "vite";
// @ts-ignore
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Unocss from 'unocss/vite';
import * as path from "path";

export default defineConfig({
  plugins: [
    vue(),
    Unocss(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      // Additional options can be added here for better functionality
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      // Additional options can be added here for better functionality
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Using __dirname for safer path resolution
    },
  },
});
