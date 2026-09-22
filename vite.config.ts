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

function matchesPackages(packageNames: string[]) {
  const packages = new Set(packageNames)
  return (id: string) => {
    const packageName = getPackageName(id)
    return packageName !== undefined && packages.has(packageName)
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "charts-echarts",
              test: matchesPackages(["echarts"]),
              priority: 1,
            },
            {
              name: "charts-renderer",
              test: matchesPackages(["zrender"]),
              priority: 2,
            },
            {
              name: "workbook",
              test: matchesPackages([
                "xlsx",
                "adler-32",
                "cfb",
                "codepage",
                "crc-32",
                "ssf",
                "wmf",
                "word",
              ]),
            },
            {
              name: "agent-tools",
              test: matchesPackages(["zod"]),
            },
          ],
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
