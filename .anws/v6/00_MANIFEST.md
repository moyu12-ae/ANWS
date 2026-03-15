# .anws v6 - 版本清单

**创建日期**: 2026-03-15
**状态**: Active
**前序版本**: v5 (2026-03-14)

## 版本目标
在 v5 已建立“多 AI IDE 单目标安装 + canonical resource projection”真相的基础上，进一步将 `anws` 演进为**面向多目标 IDE 的显式安装与统一升级分发系统**：`anws init` 支持在同一项目中显式选择多个目标 IDE 安装，内部继续坚持共享 canonical source + target-specific projection + 独立落盘；`anws update` 必须扫描并展示当前项目中的已安装 targets，再统一更新命中的受管投影，同时通过 `.anws/install-lock.json` 维护清晰、可解释的安装状态。

## 主要变更
- 将 `anws init` 从**单目标安装**升级为**同项目多目标显式安装**
- 保持 `canonical capability + resource projection + target layout` 三层模型，但允许多 target 并行落盘
- 将 `anws update` 从“单目标上下文更新”升级为“扫描已安装 targets 后的多目标统一更新”
- 引入 `.anws/install-lock.json` 作为多目标安装状态与受管投影摘要的权威记录
- 明确共享源 + 独立落盘原则，拒绝 target 间共享物理文件
- 为 `/blueprint` 准备多目标安装、状态模型、更新编排、README/帮助文案同步等任务边界

## 文档清单
- [x] 00_MANIFEST.md (本文件)
- [x] 01_PRD.md
- [x] 02_ARCHITECTURE_OVERVIEW.md
- [x] 03_ADR/ (ADR_004_MULTI_TOOL_ADAPTERS, ADR_006_CANONICAL_RESOURCE_MODEL, ADR_007_INSTALL_STATE_AND_UPDATE_ORCHESTRATION)
- [ ] 04_SYSTEM_DESIGN/ (待 /design-system 执行)
- [ ] 05_TASKS.md (由 /blueprint 生成)
- [x] 06_CHANGELOG.md
