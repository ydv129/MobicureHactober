
export default [
  {
    extends: ["next/core-web-vitals"],
    ignores: [".next/**", "node_modules/**", "public/**", "scripts/**"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
