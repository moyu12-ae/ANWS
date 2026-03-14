# Genesis v2 - 版本清单

**创建日期**: 2026-03-13
**状态**: Active
**前序版本**: v1 (2026-02-25)

## 版本目标
在 v1 CLI 基础上，新增 `anws update --check` 预检模式与升级记录自动生成机制，支持 AI 基于 `anws/changelog/` 文件自主完成业务文档升级；同步更新目录约定（`.agents/`、`anws/`）与工作流注册表协议。

## 主要变更
- `anws update --check` — 终端输出内容级别 diff（颜色高亮）
- `anws update` 执行后自动生成 `anws/changelog/v{VERSION}.md` 升级记录
- 目录约定变更：`.agent/` → `.agents/`，`genesis/` → `anws/`
- 新增 `/upgrade` 工作流支持（AI 基于 changelog 升级业务文档）
- AGENTS.md 工作流注册表增加"工作流优先原则"
- 新增 `lib/diff.js` 模块（diff 生成）

## 文档清单
- [x] 00_MANIFEST.md (本文件)
- [x] 01_PRD.md
- [x] 02_ARCHITECTURE_OVERVIEW.md
- [x] 03_ADR/ (ADR_001_TECH_STACK, ADR_002_CONFLICT_DETECTION, ADR_003_CHANGELOG_SYSTEM)
- [ ] 04_SYSTEM_DESIGN/ (待 /design-system 执行)
- [ ] 05_TASKS.md (由 /blueprint 生成)
- [x] 06_CHANGELOG.md
