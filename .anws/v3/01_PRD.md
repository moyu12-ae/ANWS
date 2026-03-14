# Product Requirements Document (PRD) v3.0

**Project**: Anws CLI
**Title**: `anws` — 一行命令，初始化 AI 协作工作流系统
**Status**: Approved
**Version**: 3.0
**Author**: Genesis Agent
**Date**: 2026-03-14
**前序版本**: v2.0 (2026-03-13)

---

## 1. Executive Summary

开发者通过 `npm install -g anws` 全局安装，在任意项目中运行 `anws init` 即可将 Anws 的完整 `.agents/` 目录结构复制到当前项目，零配置开箱可用。v3 在 v2 的升级记录能力之上，进一步补强 `anws update` 的版本安全与 `AGENTS.md` 分区更新边界：同版本不覆盖已有 changelog，`AGENTS.md` 的稳定提示词与运行态上下文被拆分管理，为 AI `/upgrade` 与后续模板演进提供可预测基础。

---

## 2. Background & Context

### 2.1 Problem Statement

- **Current Pain Point**: 用户想在新项目中使用 Anws，必须手动 clone 仓库、拷贝 `.agents/` 目录，且无法获知自己用的是哪个版本、是否过期；升级后 AI 无法感知变更内容，无法自主更新业务文档。
- **Impact Scope**: 所有想使用该工作流系统的开发者和团队。
- **Business Impact**: 分发门槛高导致采用率低；版本混乱导致维护成本高。

### 2.2 Opportunity

提供与业界工具（`create-react-app`、`shadcn/ui add` 等）一致的安装体验，让采用门槛从"手动拷贝"降低到"一行命令"，同时通过 npm 版本号解决版本追踪问题。

### 2.3 Reference & Competitors

- **`create-react-app` / `create-next-app`**: 通过 npx 一次性脚手架，内嵌模板文件。**差异**: 我们需要支持 update，且目标是注入文件到已有项目而非创建新项目。
- **`shadcn/ui add`**: 将组件文件复制到用户项目，保留用户自定义，不覆盖非目标文件。**差异**: 这是我们冲突处理策略的参考——只碰我们的文件。

---

## 3. Goals & Non-Goals

### 3.1 Goals

- **[G1]**: `npm install -g anws` 一行安装，5 秒内完成，无任何需要用户配置的步骤。
- **[G2]**: `anws init` 将完整 `.agents/` 目录写入当前目录，文件写入成功率 100%。
- **[G3]**: 若 `.agents/` 中**我们管理的文件**已存在，必须交互式询问是否覆盖，绝不静默覆盖。
- **[G4]**: 用户目录中**非我们管理的文件**（用户自行在 `.agents/` 下添加的内容）在任何情况下不受影响。
- **[G5]**: `anws update` 将我们管理的文件更新为 npm 包内的最新版本（逻辑等同于带确认的 init）。
- **[G6]**: `anws update` 执行后自动在 `anws/changelog/` 生成版本升级记录文件，供 AI `/upgrade` 工作流读取。
- **[G7]**: `anws update --check` 在不修改任何文件的前提下，在终端输出内容级别的 diff（颜色高亮）。
- **[G8]**: 当 `anws/changelog/` 中最新记录版本已等于当前 CLI 版本时，`anws update` 和 `anws update --check` 必须直接返回“Already up to date.”，不得覆盖既有 changelog 历史。
- **[G9]**: `AGENTS.md` 模板必须显式区分“稳定提示词区”和 `AUTO:BEGIN` ~ `AUTO:END` 之间的“运行态区块”，后续升级只允许按区块边界做分区更新。

### 3.2 Non-Goals (Out of Scope)

- **[NG1]**: Python/uv 安装方式 — 本版本 Node.js only。
- **[NG2]**: 版本固定 (`--tag v1.0`) — 始终使用全局安装的 npm 包版本。
- **[NG3]**: 选择性安装子集（只装 workflows 不装 skills）— 始终安装完整包。
- **[NG4]**: 自动发布流程的 GitHub Actions — 属于维护者侧基础设施，不在 CLI 功能范围内。
- **[NG5]**: Windows 原生安装器（.msi / winget）— npm 全局安装已覆盖 Windows。

---

## 4. User Stories (The "What")

### US01: 全局安装 CLI [REQ-001]

- **Story**: As a developer, I want to run `npm install -g anws`, so that I can use the `anws` command globally without project-specific setup.
- **Acceptance Criteria**:
  - [ ] **Given** Node.js ≥ 18 已安装，**When** 执行 `npm install -g anws`，**Then** `anws --version` 输出当前包版本号，退出码 0。
  - [ ] **Given** CLI 已安装，**When** 执行 `anws --help`，**Then** 输出可用命令列表 (`init`, `update`, `--version`, `--help`)。
- **Priority**: P0

---

### US02: 初始化工作流系统 [REQ-002]

- **Story**: As a developer, I want to run `anws init` in my project root, so that I get the complete `.agent/` workflow structure ready to use.
- **Acceptance Criteria**:
  - [ ] **Given** 当前目录不存在 `.agent/`，**When** 执行 `anws init`，**Then** `.agent/` 目录及完整内容被写入，退出码 0，并打印写入的文件列表。
  - [ ] **Given** 当前目录不存在 `.agent/`，**When** 执行 `anws init`，**Then** 整个过程无需任何用户输入（no prompts）。
  - [ ] **Given** init 成功，**When** 用户查看 `.agent/workflows/`，**Then** 包含所有工作流文件（genesis.md, blueprint.md, forge.md 等）。
- **Priority**: P0

---

### US03: 冲突时安全询问 [REQ-003]

- **Story**: As a developer who already has `.agent/` in my project, I want `anws init` to ask me before overwriting, so that I don't accidentally lose my customizations.
- **Acceptance Criteria**:
  - [ ] **Given** `.agent/` 已存在且含有我们管理的文件，**When** 执行 `anws init`，**Then** 终端提示 "Some files already exist. Overwrite? [y/N]"，默认 N（不覆盖）。
  - [ ] **Given** 用户回答 N，**Then** 命令退出，不修改任何文件，退出码 0，打印 "Aborted."。
  - [ ] **Given** 用户回答 Y，**Then** 仅覆盖**我们管理的文件**，用户自行添加到 `.agent/` 的其他文件保持不变。
  - [ ] **Given** `.agent/` 已存在但其中**没有**我们的文件，**When** 执行 `anws init`，**Then** 直接写入，无需询问（用户 `.agent/` 内容完全不受影响）。
  - [ ] **Error Case**: When 文件系统无写权限，**Then** 打印明确的权限错误，退出码非 0。
- **Priority**: P0

---

### US04: 更新工作流文件 [REQ-004]

- **Story**: As a developer who installed the workflow system previously, I want to run `anws update`, so that I can get the latest version of workflow files after upgrading the npm package.
- **Acceptance Criteria**:
  - [ ] **Given** `.agents/` 已存在，**When** 执行 `anws update`，**Then** 提示 "This will overwrite all managed .agents/ files. Continue? [y/N]"。
  - [ ] **Given** 用户确认，**Then** 仅覆盖我们管理的文件，用户自有文件不受影响，并打印已更新的文件列表。
  - [ ] **Given** `.agents/` 不存在，**When** 执行 `anws update`，**Then** 打印提示 "No .agents/ found. Run `anws init` first."，退出码非 0。
  - [ ] **Given** 升级成功，**Then** 自动在 `anws/changelog/v{VERSION}.md` 写入变更记录，文件包含完整的文件级与内容级变更详情。
  - [ ] **Given** `anws/changelog/` 不存在，**Then** 自动创建目录，并写入 `README.md` 保护提示。
  - [ ] **Given** `anws/changelog/` 中最新版本已是当前 CLI 版本，**When** 执行 `anws update`，**Then** 输出 "Already up to date."，不覆盖现有 `v{VERSION}.md`。
  - [ ] **Given** 根目录 `AGENTS.md` 已存在且包含 `AUTO:BEGIN` / `AUTO:END` 区块，**When** 执行后续分区更新策略，**Then** 仅允许更新区块外的模板提示词，区块内的项目运行态内容保持不变。
- **Priority**: P1

---

### US06: 预检升级内容 [REQ-006]

- **Story**: As a developer, I want to run `anws update --check` before actually updating, so that I can review what will change.
- **Acceptance Criteria**:
  - [ ] **Given** 执行 `anws update --check`，**Then** 不修改任何文件，仅在终端输出变更预览。
  - [ ] **Given** 存在新增文件，**Then** 用绿色高亮显示新增文件路径。
  - [ ] **Given** 存在修改文件，**Then** 用黄色高亮显示修改文件路径，并输出关键变更行（diff 格式）。
  - [ ] **Given** 存在删除文件，**Then** 用红色高亮显示删除文件路径。
  - [ ] **Given** 无变更，**Then** 输出 "Already up to date."，退出码 0。
  - [ ] **Given** 存在文件内容变更，**Then** 预览输出应展示逐行前后对比，包含必要的上下文行号信息。
- **Priority**: P1

---

### US07: AI 升级业务文档 [REQ-007]

- **Story**: As a developer whose project uses genesis architecture docs, I want the AI to automatically upgrade my business documents after `anws update`, so that my architecture docs stay in sync with the new framework version.
- **Acceptance Criteria**:
  - [ ] **Given** `anws/changelog/v{VERSION}.md` 存在，**When** AI 执行 `/upgrade` 工作流，**Then** AI 能读取变更详情并判断升级级别（Minor/Major）。
  - [ ] **Given** Minor 升级，**Then** AI 直接在当前 `anws/v{N}/` 中精准修改受影响的文档节点。
  - [ ] **Given** Major 升级，**Then** AI 将 `anws/v{N}/` 完整拷贝到 `anws/v{N+1}/`，在新版本中执行升级。
  - [ ] **Given** AI 需要推断填充缺失内容，**Then** 在段首标注 `> [!WARNING] AI 推断填充，请人类复核`。
- **Priority**: P2

---

### US05: 通过 GitHub 下载（无 npm）[REQ-005]

- **Story**: As a developer who prefers not to use npm global installs, I want an alternative way to get the `.agents/` files, so that I can still use the workflow system.
- **Acceptance Criteria**:
  - [ ] README 提供明确的 GitHub 手动下载说明（直接下载 zip / clone 后复制 `.agents/`）。
  - [ ] CLI 的使用体验不依赖任何网络请求（所有文件内嵌在包内，离线可用）。
- **Priority**: P1

---

## 5. User Experience & Design

### 5.1 Key User Flow — 首次安装 (Happy Path)

```
$ npm install -g anws
added 1 package ...

$ cd my-project
$ anws init

✔ Initializing Anws...

  AGENTS.md
  .agents/workflows/genesis.md
  .agents/workflows/blueprint.md
  .agents/workflows/forge.md
  ... (完整文件列表)

✔ Done! 9 files written to .agents/

  Next steps:
    1. Read AGENTS.md to understand the system
    2. Run /genesis to start a new project
```

### 5.3 Key User Flow — 预检升级 (--check)

```
$ anws update --check

╔══════════════════════════════════════════════════════════════╗
║  ANWS UPDATE PREVIEW  v1.3.0 → v1.4.0                        ║
╚══════════════════════════════════════════════════════════════╝

  [green] 新增 (2)
    + .agents/skills/sequential-thinking/SKILL.md
    + .agents/templates/ADR_TEMPLATE.md

  [yellow] 修改 (4)
    ~ .agents/workflows/design-system.md
    ~ .agents/workflows/change.md

  [red] 删除 (2)
    - .agents/skills/git-forensics/SKILL.md

执行 `anws update` 以应用以上变更。
```

### 5.4 Key User Flow — 升级后生成记录

```
$ anws update
⚠ This will overwrite all managed .agents/ files. Continue? [y/N] y

  ✔ Updated 6 files
  ✔ Generated upgrade record: anws/changelog/v1.4.0.md

  Next steps:
    Run /upgrade in your AI IDE to update your architecture docs.
```

### 5.2 Key User Flow — 已存在时 (Conflict Path)

```
$ anws init

⚠ .agents/ already exists (3 managed files found).
  Overwrite? [y/N] N

  Aborted. No files were changed.
```

### 5.5 CLI Style Guidelines

- 使用 `✔` / `⚠` / `✖` Unicode 前缀区分成功/警告/错误
- 零依赖：不使用 chalk、ora 等第三方库，用原生 ANSI 转义码
- 输出保持简洁：成功时列出文件，失败时给出明确原因和下一步

---

## 6. Constraint Analysis

### 6.1 Technical Constraints

- **Runtime**: Node.js ≥ 18（使用内置 `fs`, `path`, `readline` 模块，零运行时依赖）
- **Package Size**: npm 包应 < 500KB（仅包含 `.agents/` 内容和 CLI 脚本）
- **Offline**: 所有文件内嵌在 npm 包内，`anws init` 无需任何网络请求
- **Cross-platform**: Windows (PowerShell/cmd) + macOS + Linux 均需可用

### 6.2 Security & Compliance

- **Security**: 仅写入用户明确指定的目标目录（cwd），不操作其他路径
- **No telemetry**: 零网络请求，无数据收集

### 6.3 Time & Budget

- **Team**: 1 人开发
- **Deadline**: 尽快可用（简单工具，预计 1-2 天实现）

---

## 7. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| 安装命令执行时间 | < 10s | 实测 |
| init 命令执行时间 | < 1s | 实测 |
| 文件完整性 | 100% (所有 .agent/ 文件写入成功) | 测试验证 |
| 用户自有文件零损失 | 0 non-managed files touched | 测试验证 |

---

## 8. Definition of Done

- [ ] `npm install -g anws` 可成功安装，`anws --version` 返回正确版本
- [ ] `anws init` 在空目录正确写入全部文件
- [ ] 冲突检测逻辑经过测试：仅检测我们的文件，非管理文件不受影响
- [ ] `anws update` 正常工作
- [ ] README 包含安装说明和 GitHub 手动下载说明
- [ ] 在 macOS / Windows / Linux 三平台验证可用
- [ ] 零运行时依赖（`dependencies: {}`）

---

## 9. Appendix

### 9.1 Glossary

- **Managed files**: 由 `anws` 包内嵌的、属于 Anws 的文件清单。判断依据为与包内 `.agents/` 目录的文件路径对比。
- **User files**: 用户自行在 `.agents/` 目录下添加的、不在 managed files 清单中的文件，任何操作均不触碰。
- **Upgrade record**: `anws update` 执行后自动生成的 `anws/changelog/v{VERSION}.md`，记录本次升级的完整变更详情，供 AI `/upgrade` 工作流读取。
- **anws/ directory**: 用户项目中存放架构版本文档的目录（`anws/v1/`, `anws/v2/`...），以及 changelog 记录（`anws/changelog/`）。
- **AUTO block**: `AGENTS.md` 中 `AUTO:BEGIN` ~ `AUTO:END` 之间的运行态区块，由工作流自动维护，承载当前状态、项目结构、导航指南、任务状态等会随项目演进变化的上下文。

### 9.2 Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-25 | Initial version | Genesis Agent |
| 2.0 | 2026-03-13 | 新增 --check 预检、changelog 自动生成、.agent/→.agents/ 目录约定变更 | Genesis Agent |
| 3.0 | 2026-03-14 | 新增 update 版本安全机制、同版本 changelog 防覆盖、AGENTS AUTO 区块分区更新设计 | Genesis Agent |
