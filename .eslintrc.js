/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-typescript",
    "@vue/eslint-config-prettier/skip-formatting",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    "lines-between-class-members": [
      // 类名和成员之间的空行
      "error",
      "always",
      { exceptAfterSingleLine: true }, // 单行的除外
    ],
  },
};
