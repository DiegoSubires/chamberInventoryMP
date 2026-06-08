import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  /*css: {
    preprocessorOptions: {
      scss: {
        // Esto inyecta automáticamente el archivo en cada módulo .scss de la app
        additionalData: `@use "./src/styles/variables" as *;`,
      },
    },
  },*/
  base: "/chamberInventoryMP/",
  publicDir: "public",
  /*server: {
    port: 5175,
    strictPort: true,
  },*/
  build: {
    // 🚀 TRUCO: Cambiamos el destino de la compilación hacia el dist del Hub
    //outDir: "../tracesync-hub/dist/chamberInventoryMP",
    outDir: "./dist",
    emptyOutDir: true, // Limpia la subcarpeta antes de compilar
  },
});
