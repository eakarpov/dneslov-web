import { defineConfig } from "vitest/config";

export default defineConfig({
    // tsconfig keeps jsx: "preserve" for Next; tests need it transformed.
    esbuild: { jsx: "automatic" },
    test: {
        environment: "node",
        include: ["src/**/*.test.{ts,tsx}"],
    },
});
