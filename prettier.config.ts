module.exports = {
  $schema: "https://json.schemastore.org/prettierrc",
  printWidth: 100, // 100字符换行
  tabWidth: 2, // 2个空格缩进
  useTabs: false, // 使用空格缩进
  semi: false, // 末尾不加分号
  vueIndentScriptAndStyle: false, // vue文件script和style标签不缩进
  singleQuote: true, // 使用单引号
  quoteProps: "as-needed", // 对象属性只在需要时加引号
  bracketSpacing: true, // 对象大括号间加空格
  trailingComma: "none", // 末尾不加逗号
  jsxSingleQuote: false, // jsx不使用单引号
  arrowParens: "always", // 箭头函数只有一个参数时加括号
  insertPragma: false, // 不插入@format
  requirePragma: false, // 不需要@format
  proseWrap: "never", // markdown不换行
  htmlWhitespaceSensitivity: "strict", // html空格敏感度
  endOfLine: "auto", // 换行符
  rangeStart: 0, // 格式化范围开始
  ignorePath: ["dist/**"], // 忽略格式化的文件
  singleAttributePerLine: true, // 每个属性独占一行
  embeddedLanguageFormatting: "auto", // 自动格式化嵌入式语言
  bracketSameLine: true, // 大括号在同一行
};
