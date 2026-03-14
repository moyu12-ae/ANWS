# ADR-001: 技术栈选择

**状态**: Accepted
**日期**: 2026-03-14
**关联 PRD**: `genesis/v4/01_PRD.md`
**关联版本**: .anws v4

---

## 背景

`anws` 在 v4 中不再只是单一目标目录的模板分发 CLI，而是需要支持多工具适配、终端体验升级与后续可扩展分发能力。但核心约束没有变化：

- Node.js only
- 零运行时依赖
- Node.js ≥ 18
- 跨平台：Windows / macOS / Linux
- 文件分发与终端输出都必须可本地运行，无网络依赖

---

## 决策

继续采用 **Node.js + CommonJS + 内置模块全家桶** 作为唯一运行时技术栈，不引入第三方运行时依赖；多工具适配与终端输出升级均在这一约束下实现。

### v4 补充结论

- 多工具适配逻辑使用 JS 规则映射实现，而非引入模板引擎框架
- CLI 输出体验使用原生 ANSI + Unicode / ASCII 实现，而非引入终端 UI 库
- `anws` 仍保持“本地文件系统工具”定位，不引入服务端组件

---

## 影响范围

- `src/anws/bin/cli.js`
- `src/anws/lib/init.js`
- `src/anws/lib/update.js`
- `src/anws/lib/manifest.js`
- 未来的 `src/anws/lib/adapters/*`
- 未来的 `src/anws/lib/output/*`

---

## 权衡点

1. **零依赖 vs 输出精美度**
   - 选择零依赖，接受需要自己维护面板、符号和 ANSI 输出实现。

2. **统一语言栈 vs 更强模板能力**
   - 继续使用 JS 原生逻辑组织适配规则，而不是引入模板 DSL 或额外构建流程。

3. **本地 CLI vs 云端配置中心**
   - 继续保持纯本地工具，以避免复杂度失控。

---

## 参考

- `genesis/v4/01_PRD.md`（目录协议语义对应 `.anws/v4/01_PRD.md`）
- `genesis/v4/02_ARCHITECTURE_OVERVIEW.md`（目录协议语义对应 `.anws/v4/02_ARCHITECTURE_OVERVIEW.md`）
