# .anws v4 - 版本清单

**创建日期**: 2026-03-14
**状态**: Active
**前序版本**: v3 (2026-03-14)

## 版本目标
在 v3 的更新安全与 `AGENTS.md` 分区机制基础上，将 `anws` 演进为支持多 AI 编程工具适配与高质量终端体验的统一工作流产品：明确跨工具分发模型、命令入口映射、终端输出风格与品牌表达，使 `anws` 从“可用的模板分发 CLI”升级为“可扩展的 AI 协作工作流平台”。

## 主要变更
- 正式将“多工具适配”纳入架构真相，覆盖 Windsurf / Claude Code / Cursor / Codex 第一批目标
- 明确 `workflow / skill / command` 的分层模型：源模板、适配层、目标目录投放层
- 将终端输出体验提升为一级设计对象，纳入 CLI 体验与产品差异化能力
- 保持 Node.js 零运行时依赖约束，同时允许通过原生 ANSI、ASCII Logo、面板式输出提升 CLI 质感
- 保留 `.anws/vN` 版本化演进机制与 `AGENTS.md` 分区更新边界，不改变既有安全原则

## 文档清单
- [x] 00_MANIFEST.md (本文件)
- [x] 01_PRD.md
- [x] 02_ARCHITECTURE_OVERVIEW.md
- [x] 03_ADR/ (ADR_001_TECH_STACK, ADR_002_CONFLICT_DETECTION, ADR_003_CHANGELOG_SYSTEM, ADR_004_MULTI_TOOL_ADAPTERS, ADR_005_CLI_OUTPUT_EXPERIENCE)
- [ ] 04_SYSTEM_DESIGN/ (待 /design-system 执行)
- [ ] 05_TASKS.md (由 /blueprint 生成)
- [x] 06_CHANGELOG.md
