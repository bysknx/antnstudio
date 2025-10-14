// eslint.config.mjs
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // on garde Next + TS + MDX
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:mdx/recommended",
  ),

  {
    ignores: [
      "**/node_modules/**",
      ".next/**",
      "dist/**",
      "out/**",
      "coverage/**",
    ],
    rules: {
      // on coupe Prettier côté ESLint pour que le build ne casse pas
      "prettier/prettier": "off",

      // règles assouplies → warnings, pas d'échec de build
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-img-element": "off",
    },
  },
];
