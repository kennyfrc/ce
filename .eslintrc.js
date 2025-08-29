module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "prettier"
  ],
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
    // Unsafe rules
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-argument": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "@typescript-eslint/no-unnecessary-type-assertion": "warn",
    "@typescript-eslint/consistent-type-assertions": "error",
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
