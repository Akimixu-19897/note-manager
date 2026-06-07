## Codex Skills Policy（必须遵循）

以下为本项目协作规则：当任务命中这些 skills 的触发条件时，Codex **必须先加载并遵循对应 skill 的流程**，不得跳过。

<!-- codex-skill-policy:start -->

- vue-best-practices: C:/Users/15278/.codex/skills/vue-best-practices/SKILL.md — Vue 3 最佳实践。
- vue-development-guides: C:/Users/15278/.codex/skills/vue-development-guides/SKILL.md — Vue 开发约束与常见模式。
- vue-router-best-practices: C:/Users/15278/.codex/skills/vue-router-best-practices/SKILL.md — Vue Router 4 导航、路由守卫与参数处理。
- vue-testing-best-practices: C:/Users/15278/.codex/skills/vue-testing-best-practices/SKILL.md — Vitest / Vue Test Utils 测试规范。

<!-- codex-skill-policy:end -->

## Project Coding Policy（必须遵循）

以下规则用于约束 Codex 在本项目中生成和修改代码的方式；应优先服从项目已有架构和用户明确指令。

<!-- codex-coding-policy:start -->

- 单个代码文件尽量不要超过 300 行；测试、配置、schema、生成文件可按项目实际情况例外，但业务代码和组件代码必须优先控制体量。
- 如果代码文件超过 300 行，必须先判断是否已经承担多个职责；该拆分就拆分，把独立 UI、状态、副作用、工具函数或业务逻辑拆到职责清晰的组件、composable 或 util 中。
- 所有新增和重构代码必须做到低耦合、高内聚：模块只暴露必要接口，避免跨层直接操作内部状态，避免把多个职责堆进同一个文件。
- 优先复用项目已有工具函数、目录结构、命名方式、错误处理和测试模式。
- 不随意新增框架、重依赖或并行架构；确需新增时先说明原因。
- 项目类型：检测到 Vue 3 + Vite + TypeScript 前端项目（证据：`package.json`、`vite.config.ts`、`src/main.ts`），生成和修改代码时必须沿用当前前端架构。
- 前端样式：检测到 Tailwind CSS + 全局 SCSS + Vue SFC scoped SCSS（证据：`tailwind.config.js`、`src/assets/styles/tailwindcss.css`、`src/assets/styles/index.scss`、`src/**/*.vue` 中的 `<style lang="scss" scoped>`），生成样式时必须沿用该方案，不新增并行样式技术栈。
- UI 框架：检测到 Element Plus（证据：`package.json`、`src/main.ts`），优先使用项目已引入的组件、主题变量和设计 token，不另起一套视觉系统。
- 组件拆分以业务语义和复用边界为准，避免为了拆分而制造过深层级。
- 后端结构：未检测到后端框架（证据：未发现 `.sln`、`.csproj`、`Cargo.toml`、`pyproject.toml`、`requirements.txt`、`go.mod`、后端 controller/module/service 入口），涉及后端代码前先重新识别技术栈并沿用附近文件风格。

<!-- codex-coding-policy:end -->
