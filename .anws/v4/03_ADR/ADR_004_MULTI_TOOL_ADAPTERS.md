# ADR-004: 多 AI 编程工具适配策略

**状态**: Accepted
**日期**: 2026-03-14
**关联需求**: [REQ-001] [REQ-002] [REQ-005]
**关联版本**: .anws v4

---

## 背景

`anws` 当前已经具备一套工作流与技能资产，但这些资产仍然偏向单一环境消费。随着 Windsurf、Claude Code、Cursor、Codex 等工具进入目标范围，必须回答一个核心问题：

> `anws` 应该维护多份独立模板，还是维护一套统一源并通过适配层分发到不同工具？

---

## 决策

采用 **统一源模板 + 适配层映射 + 目标工具投放** 的三层策略。

### 三层模型

1. **Canonical Source**
   - 存放 workflow / skill / AGENTS 等权威资产
   - 不携带某个工具的长期耦合细节

2. **Adapter Layer**
   - 负责将通用资产映射为某个目标工具需要的目录结构、触发入口与命名
   - 是工具差异存在的唯一合法位置

3. **Target Tool Layout**
   - 是写入用户项目中的最终目录结构
   - 包括 `.windsurf/`, `.claude/`, `.cursor/`, `.codex/` 等

---

## 选择理由

- 避免长期维护多份接近但不一致的模板副本
- 把工具差异限制在一个可审计的层中
- 让后续新增目标工具时，不必重写业务语义资产
- 与 `anws` 作为分发系统的定位一致

---

## 第一批目标工具

- Windsurf
- Claude Code
- Cursor
- Codex

---

## 约束

1. workflow / skill 的业务语义不能因工具不同而分叉
2. 工具适配不得破坏 managed files 安全原则
3. 适配规则必须可解释，而不是散落在各处的 if/else

---

## 后果

### 正面

- 架构更简单，长期维护成本更低
- 新工具接入有清晰扩展路径
- 与 `/upgrade`、`/genesis` 的版本化演进更兼容

### 代价

- 需要显式定义 adapter 规则
- 需要为不同工具建立最小兼容矩阵
- 需要在终端输出中清楚展示“当前目标工具”上下文

---

## 参考

- `ide_example/`
- `genesis/v4/01_PRD.md`（目录协议语义对应 `.anws/v4/01_PRD.md`）
- `genesis/v4/02_ARCHITECTURE_OVERVIEW.md`（目录协议语义对应 `.anws/v4/02_ARCHITECTURE_OVERVIEW.md`）
