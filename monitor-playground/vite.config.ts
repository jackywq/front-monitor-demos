import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    open: true,
    // 配置代理，让监控SDK文件可以从monitor-core目录访问
    fs: {
      allow: ['..'] // 允许访问父目录
    }
  },
  build: {
    outDir: "dist",
  },
  publicDir: "public",
  // 配置别名，方便在代码中引用监控SDK
  resolve: {
    alias: {
      "@monitor-core": resolve(__dirname, "../monitor-core/dist"),
    },
  },
});