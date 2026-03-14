# Product Requirements Document (PRD) v4.0

**Project**: Anws CLI
**Title**: `anws` — 面向多 AI 编程工具的工作流分发与升级系统
**Status**: Approved
**Version**: 4.0
**Author**: Genesis Agent
**Date**: 2026-03-14
**前序版本**: v3.0 (2026-03-14)

---

## 1. Executive Summary

开发者通过 `npm install -g anws` 安装 CLI 后，运行 `anws init` / `anws update` 即可将 `anws` 工作流系统分发并升级到本地项目。v4 在 v3 的升级安全、changelog 历史保护与 `AGENTS.md` 分区更新机制之上，进一步将 **多 AI 编程工具适配** 与 **高质量终端输出体验** 正式纳入产品目标：同一套工作流与技能资产应可分发到不同工具目录结构中，同时 CLI 输出需要具备清晰的信息层级、品牌感和下一步引导，以提升采用率与产品辨识度。

---

## 2. Background & Context

### 2.1 Problem Statement

- **Current Pain Point**: `anws` 当前的模板与文档虽然已基本完成品牌统一，但对不同 AI 编程工具的目录约定、命令入口与技能发现机制仍缺乏正式架构定义；终端输出也以“可用”为主，尚未形成产品级体验。
- **Impact Scope**: 希望在 Windsurf、Claude Code、Cursor、Codex 等环境中复用同一套工作流系统的开发者与团队。
- **Business Impact**: 如果缺少标准适配模型，后续会陷入“每个平台手工拷贝 + 文档漂移”的维护地狱；如果 CLI 输出不具备足够质感，产品认知与用户信任感会受损。

### 2.2 Opportunity

将 `anws` 升级为“统一源模板 + 多目标适配 + 可升级”的分发系统，使工作流成为独立于单一 IDE 的资产；同时借鉴高质量脚手架工具的终端体验，形成 `anws` 自己的产品表达。

### 2.3 Reference & Competitors

- **Spec Kit**: 在初始化流程中展示品牌化 ASCII Logo、面板框、状态树与 Next Steps，终端信息层级清晰。**借鉴点**: 输出结构与视觉表达。**不照搬点**: 视觉语言、命名体系与目录契约保持 `anws` 自身一致。
- **shadcn/ui**: 以“分发用户项目文件、保留用户自定义内容”为核心模型。**借鉴点**: 文件注入与安全覆盖策略。
- **create-next-app / create-react-app**: 强化“脚手架即产品入口”的体验。**借鉴点**: 一次命令完成初始化和用户引导。

---

## 3. Goals & Non-Goals

### 3.1 Goals

- **[G1]**: `anws` 必须将 `workflow / skill / command` 视为独立资产，并支持映射到多个 AI 编程工具目标目录。
- **[G2]**: 第一批适配目标明确为 `Windsurf`、`Claude Code`、`Cursor`、`Codex`。
- **[G3]**: `anws init` 必须具备“目标工具感知”能力，能够将资产写入对应工具约定目录。
- **[G4]**: `anws update` 必须在多工具场景下仍保持 managed files 安全更新原则，不破坏用户自定义内容。
- **[G5]**: CLI 输出必须具备产品级终端体验：品牌标识、分区面板、步骤状态、警告卡片、下一步引导。
- **[G6]**: CLI 样式升级不能破坏零运行时依赖约束，不引入 `chalk`、`ora`、`boxen` 等运行时依赖。
- **[G7]**: `.anws/vN` 架构文档必须将多工具适配与终端体验视为正式架构组成，而不是零散实现细节。

### 3.2 Non-Goals (Out of Scope)

- **[NG1]**: 一次性支持所有 AI IDE/代理工具；v4 只定义第一批目标与扩展模型。
- **[NG2]**: 为不同工具维护多套独立业务文档；必须坚持统一源与适配生成。
- **[NG3]**: 引入图形化安装器或 Web UI。
- **[NG4]**: 在 v4 内完成所有目标工具的完整实现；本版本先确立架构真相与实施边界。

---

## 4. User Stories (The "What")

### US01: 多工具初始化 [REQ-001]

- **Story**: As a developer, I want `anws init` to initialize the workflow system for my chosen AI coding tool, so that I can use the same `anws` architecture in different environments.
- **Acceptance Criteria**:
  - [ ] **Given** 用户选择 Windsurf，**When** 执行初始化，**Then** 工作流与技能写入 `.windsurf/` 兼容结构。
  - [ ] **Given** 用户选择 Claude Code、Cursor 或 Codex，**When** 执行初始化，**Then** 文件写入对应工具约定目录。
  - [ ] **Given** 工具目录不存在，**Then** CLI 自动创建必要目录结构。
- **Priority**: P0

---

### US02: 统一源模板分发 [REQ-002]

- **Story**: As a maintainer, I want a single canonical source of workflows and skills, so that I do not have to manually maintain divergent copies for different tools.
- **Acceptance Criteria**:
  - [ ] 存在明确的“源模板层”。
  - [ ] 不同工具输出由适配规则生成，而不是长期手工维护多份副本。
  - [ ] 新增 workflow / skill 时，适配规则能确定它应如何分发。
- **Priority**: P0

---

### US03: 产品级 CLI 输出 [REQ-003]

- **Story**: As a developer, I want `anws` CLI to look polished and structured, so that I can quickly understand what happened and what to do next.
- **Acceptance Criteria**:
  - [ ] CLI 关键流程包含品牌化标题区域，支持 `anws` Logo 或等价品牌头部。
  - [ ] 重要信息以**实线面板**或分区块展示，而非混杂成一段纯文本。
  - [ ] 步骤执行状态以统一符号体系呈现，并支持颜色区分成功、警告、待处理、错误。
  - [ ] 成功后展示 Next Steps，警告时展示 Security / Compatibility Notice。
  - [ ] 在不支持颜色的环境下，仍能通过边框、符号和层级保持可读性。
- **Priority**: P0

---

### US04: 多工具场景下安全更新 [REQ-004]

- **Story**: As a developer, I want `anws update` to safely upgrade managed files across supported AI tools, so that I can keep my workflow system up to date without losing custom content.
- **Acceptance Criteria**:
  - [ ] `managed files` 概念在多工具场景下仍成立。
  - [ ] `update` 只更新被 `anws` 管理的目标文件。
  - [ ] 不同工具目标目录之间的映射不会导致误删用户文件。
  - [ ] changelog 仍然是升级依据，供 `/upgrade` 工作流读取。
- **Priority**: P1

---

### US05: 多工具升级路由 [REQ-005]

- **Story**: As a developer, I want `/upgrade` to understand framework-level changes caused by multi-tool support, so that architecture documents can evolve safely.
- **Acceptance Criteria**:
  - [ ] `/upgrade` 能识别“工具适配模型变化”属于 Major 级别演进。
  - [ ] 当升级涉及目录约定、命令入口或架构语义变化时，AI 会路由到 `/genesis`。
  - [ ] AI 推断填充内容必须被显式标记。
- **Priority**: P1

---

## 5. User Experience & Design

### 5.1 CLI Style Principles

- **品牌可识别**: 顶部使用 `anws` 自有 ASCII Logo 或品牌标题头，而不是普通文本标题。
- **信息分区**: 初始化摘要、进度树、安全提示、下一步引导必须是独立区块。
- **视觉层次**: 面板优先使用**实线边框**与标题栏，而不是只有细线分隔。
- **颜色语义**: 成功、进行中、待处理、警告、错误使用统一颜色语义和符号体系。
- **短而强**: 保持终端输出紧凑，不堆砌说明文字。

### 5.2 Desired CLI Sections

`anws init` / `anws update` / 未来的目标工具初始化流程应优先包含以下区块：

1. **Header / Brand**
2. **Project Setup Summary**
3. **Execution Progress Tree**
4. **Security / Compatibility Notice**
5. **Next Steps**
6. **Optional Enhancements**（如适用）

### 5.3 Example Outcome

```text
    ___    _   ___      _______
   /   |  / | / / | /| / / ___/
  / /| | /  |/ /| |/ |/ /\__ \
 / ___ |/ /|  / |  /|  /___/ /
/_/  |_/_/ |_/  |__/|__//____/

Anws - AI Workflow System

╭──────────────────────── Project Setup ────────────────────────╮
│ Tool Target    Windsurf                                       │
│ Working Path   /path/to/project                               │
│ Output Target  .windsurf/                                     │
╰───────────────────────────────────────────────────────────────╯

Initialize Anws Project
├── ● Resolve target tool
├── ● Load canonical assets
├── ● Apply target adapter
├── ○ Write managed files
└── ○ Render next steps

╭──────────────────────── Security Notice ──────────────────────╮
│ Some tool folders may contain credentials or private state.   │
│ Consider adding target tool directories to .gitignore.        │
╰───────────────────────────────────────────────────────────────╯
```

### 5.4 CLI Style Guidelines

- 使用原生 ANSI 转义码输出颜色与强调。
- 使用 Unicode / ASCII 组合构建**实线面板**、标题栏与层级块，而非依赖第三方 UI 库。
- 默认颜色语义：
  - 绿色：成功 / 完成
  - 黄色：警告 / 注意
  - 红色：错误 / 删除
  - 青色或蓝色：标题区 / 品牌区 / 信息区
- 品牌头部、摘要面板、进度树、安全卡片、Next Steps 应保持固定输出顺序。
- 不牺牲跨平台可用性；在不支持颜色的环境下仍需保持结构清晰。

---

## 6. Constraint Analysis

### 6.1 Technical Constraints

- **Runtime**: Node.js ≥ 18
- **Dependencies**: 运行时零依赖
- **Cross-platform**: Windows / macOS / Linux
- **Template Management**: 统一源模板必须能生成多个目标目录布局

### 6.2 Product Constraints

- **One Source of Truth**: 工作流与技能不能因多工具适配而出现长期分叉维护
- **Backward Safety**: 现有 `.agents/` 与 `AGENTS.md` 更新安全原则必须保留
- **Explainability**: 多工具适配规则必须能在文档中被解释与追踪

---

## 7. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| 第一批工具适配目标清晰度 | 100% 明确目录/命令映射 | 架构审查 |
| CLI 输出可读性 | 用户能在 10 秒内判断结果与下一步 | 人工验收 |
| 模板维护复杂度 | 单一源模板，不维护长期分叉副本 | 仓库结构审查 |
| 多工具升级安全性 | 0 用户自定义文件误伤 | 测试验证 |

---

## 8. Definition of Done

- [ ] `.anws/v4` 完成多工具适配与 CLI 输出体验的文档化建模
- [ ] 至少 2 份 ADR 明确记录：适配策略、终端输出体验
- [ ] PRD 中已覆盖第一批目标工具与约束
- [ ] Architecture Overview 中已体现源模板层与目标适配层
- [ ] 后续可以直接进入 `/design-system` 或 `/blueprint`

---

## 9. Appendix

### 9.1 Glossary

- **Canonical Source**: `anws` 内部被视为权威的工作流/技能模板源。
- **Adapter Layer**: 将通用资产映射到特定工具目录结构与命令入口的规则层。
- **Tool Target**: Windsurf、Claude Code、Cursor、Codex 等具体输出目标。
- **CLI Output Experience**: 指 Header、面板、状态树、Next Steps 等终端表现层能力。

### 9.2 Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 3.0 | 2026-03-14 | 更新安全机制、changelog 历史保护、AGENTS 分区更新 | Genesis Agent |
| 4.0 | 2026-03-14 | 多工具适配模型 + 产品级 CLI 输出体验正式纳入架构 | Genesis Agent |
