import globals from "globals";

export default [
  {
    files: ["public/assets/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      eqeqeq: ["error", "always"],
    },
  },
  {
    // Script clássico (não é módulo): roda antes do CSS para aplicar o tema.
    files: ["public/assets/js/theme-init.js"],
    languageOptions: { sourceType: "script" },
  },
];
