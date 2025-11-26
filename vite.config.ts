import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import { resolve } from 'path'
import { execSync } from 'node:child_process'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

const getCommitHash = () => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim()
  } catch {
    return "unknown"
  }
}

const packageVersion = process.env.npm_package_version || "0.0.0"
const buildTimestamp = new Date().toISOString()
const commitHash = getCommitHash()

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageVersion),
    __APP_COMMIT_HASH__: JSON.stringify(commitHash),
    __APP_BUILD_TIMESTAMP__: JSON.stringify(buildTimestamp),
  },
  server: {
    host: true,
    allowedHosts: true,
  },
});
