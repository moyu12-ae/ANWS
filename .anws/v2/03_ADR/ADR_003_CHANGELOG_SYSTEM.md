# ADR-003: Changelog 自动生成与升级记录系统

**状态**: Accepted  
**日期**: 2026-03-13  
**决策者**: Genesis Agent  
**关联需求**: [REQ-006] [REQ-007]  
**关联 ADR**: ADR-001 (Tech Stack)

---

## 背景 (Context)

`anws update` 执行后，用户的 `.agents/` 目录已更新至最新版本，但存在一个信息断层：

1. **AI 无法感知变更** — AI 在新会话中无法知道本次更新改变了哪些工作流文件
2. **业务文档无法自动升级** — 用户项目中的 `genesis/` 架构文档使用的是旧框架约定，升级后需要手动对照更新
3. **--check 预检缺失** — 用户无法在升级前预览变更内容，升级是"盲操作"

---

## 决策 (Decision)

### 决策 1: `anws update` 执行后自动生成升级记录

**选择**: 在用户项目的 `anws/changelog/v{VERSION}.md` 写入完整变更记录。

**候选方案对比**:

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| **A: 自动生成到项目目录** | `anws update` 后写入 `anws/changelog/v{VERSION}.md` | AI 可直接读取，持久化，版本可追溯 | 占用用户项目空间 |
| B: 写入临时文件 | 写入 `tmp/` 或系统临时目录 | 不污染用户项目 | 重启后丢失，AI 无法可靠读取 |
| C: 仅终端输出 | `anws update` 输出 diff 但不持久化 | 简单 | AI 无法在新会话中获取 |

**选择 A 的理由**:
- AI 协作的核心场景是**跨会话**的，临时存储无法满足需求
- `anws/changelog/` 作为版本历史，是项目知识库的一部分
- 与 `anws/v{N}/` 目录并列，形成完整的架构演进记录

### 决策 2: `anws update --check` 预检模式

**选择**: 新增 `--check` flag，仅输出 diff 预览，不修改任何文件。

**候选方案对比**:

| 方案 | 描述 |
|------|------|
| **A: --check flag** | `anws update --check` 输出预览，`anws update` 执行 |
| B: 交互式确认中嵌入预览 | 在 `[y/N]` 确认前自动展示 diff |

**选择 A 的理由**:
- 明确分离"查看"与"执行"的语义
- 与 `git diff` / `terraform plan` 等工具的惯例一致
- 方便 CI 脚本中使用 `--check` 做变更检测

### 决策 3: Diff 输出使用原生 ANSI 颜色

**选择**: 使用原生 ANSI 转义码（无第三方依赖）。

**颜色方案**:
- 绿色 (`\x1b[32m`) — 新增文件/行
- 黄色 (`\x1b[33m`) — 修改文件/行  
- 红色 (`\x1b[31m`) — 删除文件/行

**理由**: 保持零运行时依赖的设计约束（见 ADR-001）。

---

## 影响范围 (Impact)

### 新增文件
- `src/anws/lib/diff.js` — 文件级 + 内容级 diff 生成
- `src/anws/lib/changelog.js` — changelog 文件生成器

### 修改文件
- `src/anws/bin/cli.js` — 新增 `--check` 参数解析
- `src/anws/lib/update.js` — 调用 diff + changelog 模块

### 用户项目变化
- 新增 `anws/changelog/` 目录（由 `anws update` 首次执行时自动创建）
- 新增 `anws/changelog/README.md`（保护提示，防止误删）
- 每次 `anws update` 后生成 `anws/changelog/v{VERSION}.md`

### 对 `/upgrade` 工作流的支持
AI 可以通过读取 `anws/changelog/v{VERSION}.md` 获得完整变更详情，基于此判断升级级别（Minor/Major）并自主升级业务文档。

---

## 约束 (Constraints)

1. **不破坏现有行为** — `anws update`（无 `--check`）的交互流程与 v1 一致，仅新增 changelog 生成步骤
2. **零依赖** — diff 生成使用 `fs/promises` 逐行对比，不引入 `diff` npm 包
3. **幂等性** — 相同版本多次运行 `anws update` 只会覆盖同名 changelog 文件，不产生重复记录
4. **目录自动创建** — `anws/changelog/` 不存在时自动创建，不要求用户手动操作

---

## changelog 文件格式规范

```markdown
# 升级记录: v{VERSION}

> ⚠️ **此文件由 `anws update` 自动生成，请勿删除！**
> 删除后将导致 AI 无法获取历史升级信息，影响 `/upgrade` 工作流的判断。

## 元信息
- **升级版本**: {VERSION}
- **升级时间**: {ISO 8601 时间戳}
- **升级类型**: 由 `/upgrade` 工作流判断 (Minor/Major/Patch)

## 变更摘要
- {自动生成的摘要行}

## 文件级变更清单

### 新增文件
- `{path}`

### 修改文件
- `{path}`

### 删除文件
- `{path}`

## 内容级变更详情

### `{path}`
```diff
- 旧内容行
+ 新内容行
```
```

---

## 参考 (References)

- [ADR-001] Tech Stack — 零依赖约束
- [REQ-006] 预检升级内容 (`--check`)
- [REQ-007] AI 升级业务文档 (`/upgrade` 工作流)
- `upgrade_implementation_plan.md` — 详细实现计划
