# ADR-001: 技术栈选择

**状态**: Accepted
**日期**: 2026-02-25
**关联 PRD**: `genesis/v1/01_PRD.md`

---

## 背景

`anws` 是一个 CLI 工具，功能是把 Antigravity Workflow System 的 `.agent/` 目录一键分发到开发者的项目中。技术选型必须满足以下约束：

- Node.js only（用户明确限定）
- 零运行时依赖（`"dependencies": {}`）
- Node.js ≥ 18
- 跨平台：Windows / macOS / Linux
- 单人开发，快速交付（1–2 天）

---

## 决策

**选择 Node.js + CommonJS + 内置模块全家桶**，不引入任何第三方运行时依赖。

| 模块 | 选择 | 理由 |
|------|------|------|
| 参数解析 | `node:util` parseArgs | Node 18+ 内置，覆盖所有需要的命令 |
| 交互 prompt | `node:readline` | 内置，Y/N 确认足够 |
| 文件操作 | `node:fs/promises` + `node:path` | 内置，递归复制完全满足 |
| 模块格式 | **CommonJS (CJS)** | `__dirname` 天然可用，定位包内模板目录最简单 |
| 包名 | `anws` | npm registry 查询确认未被占用（2026-02-25 验证） |

---

## 候选方案对比

| 候选 | 优势 | 劣势 | 结论 |
|------|------|------|------|
| **CJS + 内置模块** (本选择) | 零依赖、`__dirname` 简单、兼容性最佳 | 非最新 ES 风格 | ✅ 采纳 |
| ESM + 内置模块 | 现代标准 | `__dirname` 需用 `import.meta.url` 替代，多一步操作 | ❌ 放弃 |
| commander.js + inquirer | 开发体验好 | 引入运行时依赖，违反约束 | ❌ 不符合约束 |
| Deno / Bun | 现代工具链 | 用户明确要求 Node.js only | ❌ 不符合约束 |

**12 维度评估（CJS + 内置模块）**:

| 维度 | 分数 (1-5) | 说明 |
|------|:----------:|------|
| 需求匹配 | 5 | 所有功能均可用内置模块实现 |
| 扩展性 | 4 | 增加子命令只需 switch-case |
| 性能 | 5 | CLI 对性能要求极低，文件复制毫秒级 |
| 安全性 | 5 | 零第三方依赖 = 零供应链攻击面 |
| 团队技能 | 5 | Node.js 内置 API 最广泛熟知 |
| 人才市场 | 5 | Node.js 生态极大 |
| 开发速度 | 4 | 无框架加持，但功能简单 |
| TCO | 5 | 零依赖 = 零维护成本 |
| 社区生态 | 5 | Node.js 社区成熟 |
| 长期维护 | 5 | 内置模块不会被废弃 |
| 集成能力 | 4 | npm 生态天然集成 |
| AI 就绪 | N/A | 此工具无 AI 需求 |
| **总分** | **52/55** | |

---

## npm 发布前置条件 (Publishing Checklist)

> **这是用户提出的核心疑虑，特别说明：**

### 维护者（包发布者）需要做什么

1. **注册 npm 账号**: 前往 [npmjs.com](https://npmjs.com) 创建账号
2. **本地登录**: `npm login`（会跳转浏览器或终端输入）
3. **准备 package.json**:
   ```json
   {
     "name": "anws",
     "version": "1.0.0",
     "bin": { "anws": "./bin/cli.js" },
     "files": ["bin/", "lib/", "templates/"],
     "engines": { "node": ">=18" },
     "dependencies": {}
   }
   ```
4. **CLI 入口第一行** (shebang，Unix 可执行的关键):
   ```js
   #!/usr/bin/env node
   ```
5. **发布**: `npm publish --access public`
6. **验证**: `npx anws --version` 或 `npm install -g anws && anws --version`

### 用户（使用者）只需要

- Node.js ≥ 18 已安装（通常系统自带或 nvm 管理）
- `npm install -g anws`（一行命令，无其他前置）

### Windows 平台 shebang 说明

- Unix/macOS：shebang (`#!/usr/bin/env node`) 必须存在
- Windows：当通过 `npm install -g` 全局安装时，npm 会自动生成对应的 `.cmd` 包装文件，shebang 问题由 npm 自动处理，**用户无感知**
- 结论：只要通过 npm 安装，跨平台无问题

### GitHub 手动下载（无 npm 的备选）

- 发布 GitHub Release，附带 `.zip` 包含 `.agent/` 目录内容
- 用户手动解压，将 `.agent/` 复制到项目根目录
- 无需 Node.js，完全手动

---

## 权衡点

1. **无第三方框架 vs 手写解析**: 用 `parseArgs` 而非 commander，代价是需要自己写 `--help` 文本格式化。对于 2 个子命令的 CLI 来说，代价极低。

2. **CJS vs ESM**: 选 CJS 的唯一代价是无法用 top-level await，但 CLI 的异步逻辑可用 `async main()` 包裹，完全不是问题。

3. **包名 `anws` 风险**: 当前（2026-02-25）包名未被占用，但未来有被抢注风险。**备选包名**: `anws-cli` 或 scoped 包 `@antigravity/anws`。

---

## 后续行动

- [ ] 初始化 npm 包: `npm init` in `src/cli-package/`
- [ ] 验证 `anws` 包名可注册（发布前）
- [ ] 实现 `bin/cli.js` + `lib/` 模块
- [ ] 将 `.agent/` 内容复制到 `templates/` 目录
- [ ] 发布到 npm

---

## 参考

- Node.js `parseArgs` 文档: https://nodejs.org/api/util.html#utilparseargsconfig
- npm `bin` 字段: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#bin
- npm 发布指南: https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages
