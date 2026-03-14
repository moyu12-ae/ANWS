# `.anws/` 目录协议迁移手册

## 目标

将历史上分裂的两套目录协议：

- `genesis/v{N}/`（版本化架构文档）
- `anws/changelog/`（升级记录）

统一收束为单一根目录：

- `.anws/v{N}/`
- `.anws/changelog/`

---

## 为什么要迁移

### 旧模型的问题

- 架构版本与升级记录分散在两个根目录中，语义割裂
- `AGENTS.md`、`/upgrade`、`/genesis`、`/probe` 等工作流需要同时理解两套路径
- AI 在跨会话恢复时，需要推断“版本文档”和“升级记录”分别在哪，增加出错面

### 新模型的好处

- `.anws/` 成为唯一架构根目录
- 版本文档与 changelog 语义统一
- 后续 workflows / skills / CLI 文案都可围绕一套路径约定编写
- 更适合多 AI 编程工具适配场景下的统一认知

---

## 新的目录协议

```text
.anws/
├── changelog/
│   ├── README.md
│   └── vX.Y.Z.md
├── v1/
├── v2/
├── v3/
└── vN/
```

### 规则

- `.anws/v{N}/` 是版本化架构文档目录
- `.anws/changelog/` 是 `anws update` 生成的升级记录目录
- AI 在恢复项目上下文时，应优先读取：
  - `AGENTS.md`
  - `.anws/v{N}/02_ARCHITECTURE_OVERVIEW.md`
  - `.anws/v{N}/05_TASKS.md`（若存在）
  - `.anws/changelog/vX.Y.Z.md`（在升级场景下）

---

## 文档迁移规则

### 1. 路径替换规则

| 旧路径 | 新路径 |
|--------|--------|
| `genesis/v{N}/...` | `.anws/v{N}/...` |
| `anws/changelog/...` | `.anws/changelog/...` |
| `genesis/` | `.anws/`（仅在表达统一根目录语义时） |

### 2. 协议语义规则

- 不再将 `genesis/` 视为对外主目录语义
- `genesis` 保留为历史工作流名称，直到相关 prompts 全部完成迁移
- 文档与 AGENTS 协议应优先使用 `.anws/` 作为用户可见路径

### 3. 人工校验点

迁移后必须检查：

- `AGENTS.md` 是否已指向 `.anws/`
- `PRD` / `Architecture Overview` / `ADR` 是否仍残留旧路径
- `/upgrade` 是否以 `.anws/changelog/` 和 `.anws/v{N}/` 为输入
- `/probe`、`/quickstart`、`/genesis` 是否仍残留强绑定 `genesis/` 的目录说明

---

## 兼容期说明

> [!WARNING]
> AI 推断填充，请人类复核。
>
> 在迁移过渡期内，仓库中可能同时存在：
> - 物理文件仍位于 `genesis/vN/`
> - 文档语义已统一为 `.anws/vN/`
>
> 这是允许的临时状态。目标是先统一协议与认知，再统一 workflow prompts 和实现层。

---

## 本轮文档范围

本轮优先修改：

- `src/anws/templates/AGENTS.md`
- `genesis/v4/*`
- `update_log.md`

后续继续修改：

- `src/anws/templates/.agents/workflows/*`
- 引用目录协议的 skills 文档
- CLI 帮助文本与实现细节文档
