# Product Requirements Document (PRD) v6.0

**Project**: Anws CLI
**Title**: `anws` — 面向多 AI IDE 的多目标安装与统一资源投影系统
**Status**: Draft
**Version**: 6.0
**Author**: Genesis Agent
**Date**: 2026-03-15
**前序版本**: v5.0 (2026-03-14)

---

## 1. Executive Summary

`anws` 已在 v5 拍板“单目标 IDE 安装 + canonical resource projection”模型，并完成第一轮 CLI 落地。但新的产品需求已经明确：同一项目需要支持多个 AI IDE target 并存安装，`update` 也必须从“单目标上下文升级”演进为“扫描、展示、统一更新多个已安装 targets”的受管分发器。本版本的核心目标是在不牺牲 canonical source、受管更新边界与 CLI 可解释性的前提下，引入**多目标显式安装**、**多目标扫描更新**与**显式安装状态文件**。

---

## 2. Background & Context

### 2.1 Problem Statement

- **Current Pain Point**: v5 已经把 `anws` 从固定 `.agents` 目录演进为 target-aware 单目标分发器，但仍然把“一个项目只能安装一个 target”作为正式产品边界。这与实际用户场景冲突：同一项目可能同时使用 Windsurf、Cursor、Claude、Copilot、Codex 等多个 AI IDE，需要在同一代码库中维持多套 target-specific 投影。
- **Impact Scope**: 影响希望在单个项目里同时服务多种 AI IDE 工作方式的开发者、团队维护者，以及需要统一升级受管工作流资产的 CLI 维护者。
- **Business Impact**: 如果继续停留在单目标安装，用户会手动复制多套目录，导致安装状态不可追踪、`update` 无法可靠识别、README 与实际行为分叉，最终削弱 `anws` 作为统一分发器的产品价值。

### 2.2 Opportunity

将 `anws` 定义为“**统一源资产 + 多目标显式安装 + 扫描型统一更新 + 安装状态显式记录**”的 CLI 产品，使同一项目可以同时服务多个 AI IDE 而不丢失受管边界；同时保持 canonical source、独立落盘与安全更新原则不变。

### 2.3 Reference & Competitors

- **Spec Kit / skills/src**: 提供了多 agent / 多目标选择与安装编排案例。**借鉴点**: 交互式多选、按 target 编排安装、显式选择优于隐式猜测。**不照搬点**: `anws` 仍坚持 `.anws/vN` 版本化架构、受管投影清单、升级安全语义。
- **shadcn/ui**: 以文件分发与保留用户自定义为核心。**借鉴点**: 文件注入与 managed files 边界。
- **create-next-app / create-react-app**: 强调初始化流程中的明确选择与下一步引导。**借鉴点**: 让 `init` 成为真正的产品入口。

---

## 3. Goals & Non-Goals

### 3.1 Goals

- **[G1]**: `anws init` 必须支持在同一项目中显式选择多个目标 AI IDE 并一次性完成安装。
- **[G2]**: `anws` 内部必须拥有独立于目标目录的权威资源模型，不能再把 `.agents/` 视为系统真相。
- **[G3]**: 第一批目标工具明确为 `Windsurf`、`Antigravity / .agents`、`Cursor`、`Claude`、`GitHub Copilot`、`Codex`。
- **[G4]**: 统一源资产必须可以投影为 `workflow / skill / prompt / command / agent` 等目标资源形态。
- **[G5]**: `anws update` 必须扫描项目中所有已安装 targets，展示扫描结果后默认统一更新全部命中的受管投影。
- **[G6]**: 多目标安装状态必须通过显式状态文件（如 `.anws/install-lock.json`）记录，目录扫描只作为兜底。
- **[G7]**: README、CLI help、安装提示文案必须与多目标安装/更新机制同步。
- **[G8]**: 继续保持 CLI 品牌输出定稿结果，不因本轮架构演进回退体验质量。

### 3.2 Non-Goals (Out of Scope)

- **[NG1]**: 通过共享物理文件、软链接或 target 间桥接来复用落盘文件。
- **[NG2]**: 为每个 IDE 长期维护独立的一整套业务内容副本。
- **[NG3]**: 在 v6 内完成所有反安装、迁移、修复命令的完整实现。
- **[NG4]**: 推翻现有 `.anws/vN` 版本化机制、canonical source 路线或 CLI 品牌输出方案。

---

## 4. User Stories (The "What")

### US01: 多目标 IDE 初始化 [REQ-001] (优先级: P0)

*   **故事描述**: 作为一个开发者，我想要 `anws init` 支持在同一项目中显式选择多个目标 AI IDE，以便一次性安装多个 target-specific 投影。
*   **用户价值**: 让同一项目可以同时服务多种 AI IDE 工作流，而不需要手动复制目录。
*   **独立可测性**: 在空项目中执行 `anws init`，选择 2 个以上 target，验证对应目录全部写入且安装状态文件同步生成。
*   **涉及系统**: `cli-orchestrator`, `projection-planner`, `target-layout-writer`, `canonical-resource-source`
*   **验收标准 (Acceptance Criteria)**:
    *   [ ] **Given** 用户执行 `anws init`，**When** CLI 进入初始化流程，**Then** 必须支持显式选择一个或多个目标 IDE。
    *   [ ] **Given** 用户选择多个 targets，**When** 初始化执行，**Then** CLI 必须分别写入每个 target 对应的目录与文件。
    *   [ ] **Given** 某个 target 所需目录不存在，**When** 初始化执行，**Then** CLI 自动创建必要目录结构。
    *   [ ] **异常处理**: 当某个 target 的写入失败时，CLI 必须清晰报告失败 target，并保证已成功 target 的结果与状态文件一致。
*   **边界与极限情况**:
    *   同一批次选择 6 个首批 targets 时，CLI 仍能按 target 输出清晰安装摘要。
    *   用户重复选择已安装 target 时，CLI 不能生成重复状态记录或重复托管文件摘要。

---

### US02: 统一源资源投影 [REQ-002] (优先级: P0)

*   **故事描述**: 作为一个维护者，我想要继续使用独立于目标目录的 canonical resource model，以便多目标安装不会退化成多份模板副本维护。
*   **用户价值**: 降低新增 target 和维护多目标安装时的复杂度。
*   **独立可测性**: 增加或修改一个 canonical capability 后，可验证多个 target 的投影结果同步变化，而无需维护多份内容副本。
*   **涉及系统**: `canonical-resource-source`, `projection-planner`
*   **验收标准 (Acceptance Criteria)**:
    *   [ ] **Given** 存在明确的 canonical resource model，**When** 为多个 targets 生成投影，**Then** 每个 target 都通过投影规则得到自己的物理文件布局。
    *   [ ] **Given** 多个 targets 共享同一语义能力，**When** CLI 执行安装或更新，**Then** 内部仍只消费一份 canonical source。
    *   [ ] **异常处理**: 当某个 target 的 projection rule 缺失或不完整时，CLI 必须拒绝生成该 target 的落盘结果并提示缺失规则。
*   **边界与极限情况**:
    *   同一 capability 在不同 target 中映射为不同资源形态时，命名与路径规则必须保持可解释。
    *   不允许通过共享物理文件或软链接规避 target-specific 落盘。

---

### US03: 目标适配矩阵 [REQ-003] (优先级: P0)

*   **故事描述**: 作为一个维护者，我想要一份明确的多目标投影矩阵，以便安装、更新和文档行为都能被解释和验证。
*   **用户价值**: 让用户知道每个 target 到底会写哪些目录与资源类型。
*   **独立可测性**: 对每个首批 target 单独执行 install/update preview，验证输出与矩阵一致。
*   **涉及系统**: `projection-planner`, `target-layout-writer`
*   **验收标准 (Acceptance Criteria)**:
    *   [ ] **Given** Windsurf target，**When** 生成投影，**Then** 物理布局为 `.windsurf/workflows/` + `.windsurf/skills/`。
    *   [ ] **Given** Antigravity target，**When** 生成投影，**Then** 物理布局为 `.agents/workflows/` + `.agents/skills/`，并兼容 `AGENTS.md`。
    *   [ ] **Given** Cursor / Claude / GitHub Copilot / Codex targets，**When** 生成投影，**Then** 其目录布局与资源形态必须与 ADR 中定义的矩阵一致。
    *   [ ] **异常处理**: 当用户选择的 target 不在受支持矩阵内时，CLI 必须拒绝安装并展示可用 targets。
*   **边界与极限情况**:
    *   同时安装多个 targets 时，矩阵解释必须仍然按 target 清晰分组。
    *   不允许将某个 target 的 layout 误投放到另一个 target 目录。

---

### US04: 多目标扫描更新 [REQ-004] (优先级: P0)

*   **故事描述**: 作为一个开发者，我想要 `anws update` 自动扫描并展示当前项目中已安装的多个 targets，然后默认统一更新它们的受管投影，以便减少逐个维护成本。
*   **用户价值**: 避免我在多 target 项目里手动判断哪些目录该更新。
*   **独立可测性**: 在同一项目中预置多个已安装 targets，执行 `anws update` 或 `anws update --check`，验证扫描结果、展示摘要与更新范围一致。
*   **涉及系统**: `cli-orchestrator`, `projection-planner`, `target-layout-writer`
*   **验收标准 (Acceptance Criteria)**:
    *   [ ] **Given** 项目中已安装多个 targets，**When** 用户执行 `anws update`，**Then** CLI 必须先扫描并展示命中的 targets。
    *   [ ] **Given** 扫描命中多个 targets，**When** 用户继续执行 update，**Then** CLI 默认更新全部命中的受管投影文件。
    *   [ ] **Given** 用户执行 `anws update --check`，**When** 存在多个已安装 targets，**Then** 预览结果必须按 target 分组展示差异。
    *   [ ] **异常处理**: 当某个 target 更新失败时，CLI 允许部分成功，但必须明确报告失败 target，并保持成功 target 的结果与状态记录一致。
*   **边界与极限情况**:
    *   没有安装任何 target 时，CLI 必须清楚提示未检测到受管安装状态。
    *   lock 文件与真实目录漂移时，CLI 必须给出修复或重建状态的提示。

---

### US05: 安装状态权威记录 [REQ-005] (优先级: P0)

*   **故事描述**: 作为一个维护者，我想要一份显式的安装状态文件来记录已安装 targets、版本和受管投影摘要，以便 `update` 不再只靠目录猜测。
*   **用户价值**: 让多目标项目的升级行为可预测、可恢复、可审计。
*   **独立可测性**: 完成一次多目标 init/update 后，验证 `.anws/install-lock.json` 能独立说明当前安装状态，并可支撑后续 update 扫描。
*   **涉及系统**: `cli-orchestrator`, `projection-planner`
*   **验收标准 (Acceptance Criteria)**:
    *   [ ] **Given** 用户完成多目标安装，**When** CLI 写入项目状态，**Then** 必须生成或更新 `.anws/install-lock.json`。
    *   [ ] **Given** lock 文件存在，**When** 用户执行 `anws update`，**Then** lock 文件必须作为已安装 target 与受管投影摘要的主要依据。
    *   [ ] **Given** lock 文件与真实目录不一致，**When** CLI 执行扫描，**Then** 必须报告漂移并进入修复或兜底判断路径。
    *   [ ] **异常处理**: 当 lock 文件损坏或缺失时，CLI 必须能够通过目录扫描兜底，并提示重建状态。
*   **边界与极限情况**:
    *   用户手动删除某个 target 目录时，lock 重建语义必须清晰。
    *   同一 target 多次安装不能在 lock 中留下重复条目。

---

### US06: 文案与帮助一致性 [REQ-006] (优先级: P1)

*   **故事描述**: 作为一个开发者，我想要 README 和 CLI help 文案准确反映多目标安装与扫描更新模型，以便产品行为可预测。
*   **用户价值**: 降低理解成本，减少误操作。
*   **独立可测性**: 查看 `anws --help` 与 README，验证其已明确表达多目标安装、扫描更新和安装状态文件语义。
*   **涉及系统**: `cli-orchestrator`
*   **验收标准 (Acceptance Criteria)**:
    *   [ ] **Given** 用户查看 `anws --help`，**When** 阅读 init / update 说明，**Then** 能明确知道 init 支持多 target 安装、update 会扫描并展示命中 targets。
    *   [ ] **Given** 用户阅读 README / README_CN / `src/anws/README*.md`，**When** 查看安装与更新章节，**Then** 文案必须与多目标模型一致。
    *   [ ] **异常处理**: 当文档中的示例命令与 CLI 实际行为不一致时，发布前必须视为阻塞缺陷。
*   **边界与极限情况**:
    *   README 的目录树示例必须能表达多 target 共存，而不误导为共享物理文件。
    *   帮助文本必须解释 lock 文件与目录扫描的关系。

---

## 5. Resource Model

### 5.1 Canonical Resource Model

v6 继续采用三层内部真相：

1. **Capability**
   - 表示 `anws` 想交付的语义能力，例如 `genesis`、`blueprint`、`spec-writer`。
2. **Resource Projection**
   - 表示某个 capability 在目标工具上应投影成何种资源形态，例如 workflow、skill、command、prompt、agent。
3. **Target Layout**
   - 表示最终写入用户项目的物理目录与文件命名。

### 5.2 Why Not Use Direct Directory Truth

- `.agents/` 只是一种历史目标布局，不应再被视为系统真相。
- 同一 capability 在 Cursor / Claude 中更像 command，在 Copilot 中会拆成 agent + prompt，在 Codex 中可能是 prompt + skill。
- 如果内部模型等于目录模型，扩展新 IDE 时会被迫复制和改写大量文件清单。

### 5.3 Multi-Target State Model

v6 新增显式状态层：

1. **Install Lock**
   - 记录项目内所有已安装 targets、安装版本、managed projection 摘要。
2. **Directory Scan Fallback**
   - 当 lock 缺失、损坏或与文件系统漂移时，用于兜底识别真实 target 状态。
3. **Per-Target Managed Ownership**
   - 每个 target 的受管文件集合必须能独立识别、独立更新、独立报错。

---

## 6. Target Matrix

| Target IDE | Primary Projection | Layout |
|------------|--------------------|--------|
| Windsurf | workflow + skill | `.windsurf/workflows/`, `.windsurf/skills/` |
| Antigravity | workflow + skill | `.agents/workflows/`, `.agents/skills/` |
| Cursor | command | `.cursor/commands/` |
| Claude | command | `.claude/commands/` |
| GitHub Copilot | agent + prompt | `.github/agents/`, `.github/prompts/` |
| Codex | prompt + skill | `.codex/prompts/`, `.codex/skills/` |

---

## 7. Constraints

- **Runtime**: Node.js ≥ 18
- **Dependencies**: 零运行时依赖
- **Cross-platform**: Windows / macOS / Linux
- **Backward Safety**: 现有 `.agents` 与 `AGENTS.md` 安全原则不能丢
- **Explainability**: 目标矩阵与投影规则必须能在文档中解释清楚
- **Partial Success Semantics**: 多目标 update 允许部分成功，但必须逐 target 报告结果并保持状态一致性
- **State Authority**: `.anws/install-lock.json` 是主要状态真相，目录扫描仅作兜底

---

## 8. Definition of Done

- [ ] `.anws/v6` 正式记录多目标 IDE 安装与扫描更新模型
- [ ] PRD 清楚定义 canonical resource model、install lock 与投影矩阵
- [ ] Architecture Overview 体现多目标安装编排、状态文件与 per-target managed ownership
- [ ] 至少 2 份 ADR 记录多目标安装与安装状态决策
- [ ] 后续可直接进入 `/blueprint` 拆任务
