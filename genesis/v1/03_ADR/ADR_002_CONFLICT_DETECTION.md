# ADR-002: 冲突检测与托管文件策略

**状态**: Accepted
**日期**: 2026-02-25
**关联 PRD**: US03 [REQ-003], US04 [REQ-004]

---

## 背景

当用户运行 `anws init` 时，目标目录可能已存在 `.agent/` 目录（之前安装过，或用户自己创建的）。需要决定：

1. 如何判断哪些文件"属于我们"（需要更新）vs "属于用户"（绝不触碰）？
2. 冲突时应当如何处理？

---

## 决策

**策略: 静态 Manifest + 全量比对 + 单次确认**

### 核心机制

在 `lib/manifest.js` 中维护一个**静态数组**，列出 npm 包内所有模板文件的相对路径：

```js
// lib/manifest.js
const MANAGED_FILES = [
  'AGENTS.md',
  '.agent/workflows/genesis.md',
  '.agent/workflows/blueprint.md',
  '.agent/workflows/forge.md',
  '.agent/workflows/change.md',
  '.agent/workflows/scout.md',
  '.agent/workflows/craft.md',
  '.agent/workflows/design-system.md',
  // ... 完整列表 (与 templates/.agent/ 目录内容对应)
];

module.exports = { MANAGED_FILES };
```

### 冲突检测流程

```
anws init 被调用时:
  1. 遍历 MANAGED_FILES 列表
  2. 对每个文件，检查 path.join(cwd, file) 是否已存在
  3. 如果有任何一个文件已存在 → "冲突状态"
  4. 在冲突状态 → 打印冲突文件数 + 询问 Y/N（默认 N）
  5. 用户确认 Y → 仅覆盖 MANAGED_FILES 内的文件
  6. 用户选择 N / 超时 → abort，不修改任何文件
```

### 新增文件时的维护规则

每次向 `templates/.agent/` 新增文件时，**必须同步更新** `MANAGED_FILES` 数组。这是维护者的职责（通过 PR review / checklist 保证）。

---

## 候选方案对比

| 方案 | 描述 | 优势 | 劣势 | 结论 |
|------|------|------|------|------|
| **静态 Manifest** (本选择) | 硬编码的文件路径数组 | 简单透明，行为可预测 | 新增文件时需手动更新 | ✅ 采纳 |
| 哈希比对 | 对比文件内容 hash | 更精细（只更新真正变化的文件） | 实现复杂，需维护 hash DB | ❌ 过度设计 |
| 目录比对 | 递归比对 `templates/.agent/` 与 `.agent/` | 自动捕获新文件 | 无法区分用户文件 vs 我们的文件 | ❌ 破坏用户数据安全 |
| `.anws-managed` 标记文件 | 在每个被管理文件中加注释标记 | 自描述 | Markdown 文件不适合嵌入元数据 | ❌ 侵入性太强 |

---

## 权衡点

1. **静态 Manifest 手动维护成本**: 每次新增模板文件时需同步更新 `manifest.js`。对于这个工具，新文件频率低，成本可接受。

2. **全量 Y/N vs 逐文件确认**: 采用"全量一次确认"而非"逐文件询问"。原因：逐文件确认对有 30+ 模板文件的场景极度繁琐，用户体验差。

3. **默认 N**: 冲突时默认不覆盖（保守策略），防止误操作。用户数据安全优先。

---

## 后果

- **正面**: 行为完全透明，用户可以通过查看 `manifest.js` 知道哪些文件会被覆盖。
- **负面**: 维护者必须记住在添加新模板文件时更新清单。
- **后续行动**: 在 `README.md` 的"维护者文档"部分说明此规则；考虑在 CI 中加一个 lint 检查（验证 manifest 与 templates 目录的一致性）。
