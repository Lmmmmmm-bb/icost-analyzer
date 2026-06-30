import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

function getPackageName(id: string) {
  const normalizedId = id.replaceAll(path.sep, "/")
  const marker = "/node_modules/"
  const packageStart = normalizedId.lastIndexOf(marker)
  if (packageStart === -1) return

  const packagePath = normalizedId.slice(packageStart + marker.length)
  const [scopeOrName, name] = packagePath.split("/")
  return scopeOrName?.startsWith("@") ? `${scopeOrName}/${name}` : scopeOrName
}

function getVendorChunk(id: string) {
  const packageName = getPackageName(id)
  if (!packageName) return

  if (["react", "react-dom", "scheduler"].includes(packageName)) {
    return "vendor-react"
  }

  if (packageName === "echarts") return "vendor-echarts"
  if (packageName === "zrender") return "vendor"

  if (
    [
      "xlsx",
      "adler-32",
      "cfb",
      "codepage",
      "crc-32",
      "ssf",
      "wmf",
      "word",
    ].includes(packageName)
  ) {
    return "vendor-xlsx"
  }

  if (
    [
      "@base-ui/react",
      "@base-ui/utils",
      "@floating-ui/react-dom",
      "@floating-ui/utils",
      "use-sync-external-store",
    ].includes(packageName)
  ) {
    return "vendor-base-ui"
  }

  if (packageName === "@remixicon/react") return "vendor-icons"

  if (["react-day-picker", "date-fns", "@date-fns/tz"].includes(packageName)) {
    return "vendor-calendar"
  }

  return "vendor"
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return
          return getVendorChunk(id)
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
