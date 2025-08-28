module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ["eslint:recommended", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
  },
  ignorePatterns: ["dist/", "dist-test/"],
  plugins: ["@typescript-eslint"],
  rules: {
    // Ban explicit any with controlled escape hatch
    "@typescript-eslint/no-explicit-any": [
      "error",
      {
        fixToUnknown: true,
        ignoreRestArgs: false,
      },
    ],
    // Additional recommended rules
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/prefer-as-const": "warn",
    "no-console": "warn",
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        // TypeScript specific rules
        "@typescript-eslint/explicit-function-return-type": "warn",
        "@typescript-eslint/explicit-module-boundary-types": "warn",
      },
    },
  ],
};
