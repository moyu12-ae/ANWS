# Genesis v3 - 版本清单

**创建日期**: 2026-03-14
**状态**: Active
**前序版本**: v2 (2026-03-13)

## 版本目标
在 v2 的升级记录体系基础上，补全 `anws update` 的版本安全机制与 `AGENTS.md` 分区更新设计：确保同版本更新不会覆盖历史 changelog，并明确 `AUTO:BEGIN` ~ `AUTO:END` 运行态区块的保护与后续合并更新策略。

## 主要变更
- `anws update` 在执行前检测 `anws/changelog/` 最新版本；同版本时直接返回 `Already up to date`
- `anws/changelog/v{VERSION}.md` 改为历史保护模式：已记录版本不可被同版本更新覆盖
- `anws update --check` 与正式更新统一使用细粒度内容级 diff，支持逐行前后对比
- `AGENTS.md` 模板重构为“稳定提示词区 + AUTO 运行态区”，为后续分区合并更新提供边界
- 明确 `/genesis`、`/blueprint`、`/forge` 仅维护 `AUTO` 区块的职责边界

## 文档清单
- [x] 00_MANIFEST.md (本文件)
- [x] 01_PRD.md
- [x] 02_ARCHITECTURE_OVERVIEW.md
- [x] 03_ADR/ (ADR_001_TECH_STACK, ADR_002_CONFLICT_DETECTION, ADR_003_CHANGELOG_SYSTEM)
- [ ] 04_SYSTEM_DESIGN/ (待 /design-system 执行)
- [ ] 05_TASKS.md (由 /blueprint 生成)
- [x] 06_CHANGELOG.md
