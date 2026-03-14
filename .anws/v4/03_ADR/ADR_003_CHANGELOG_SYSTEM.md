# ADR-003: Changelog 自动生成与升级记录系统

**状态**: Accepted
**日期**: 2026-03-14
**关联需求**: [REQ-004] [REQ-005]
**关联版本**: .anws v4

---

## 背景

v3 已建立 `.anws/changelog/` 历史保护与 `/upgrade` 读取模型。v4 引入多工具适配后，升级记录系统需要继续承担两项职责：

1. 让 AI 知道本次升级影响了哪些资产和哪些目标工具
2. 让 `/upgrade` 能区分局部文案变更与架构级适配变更

---

## 决策

继续保留 `.anws/changelog/v{VERSION}.md` 作为升级唯一依据，并在 v4 中扩展其语义：

- 记录受影响的目标工具范围
- 记录 workflow / skill / command / template 的变更归类
- 为 `/upgrade` 判断 Minor / Major 提供更稳定的输入

### v4 补充要求

- changelog 摘要中应体现本次升级影响的工具目标
- 若变更涉及目录约定、命令入口或统一源模型，`/upgrade` 应优先评估为 Major
- changelog 仍坚持同版本不可覆盖策略

---

## 影响范围

- `src/anws/lib/changelog.js`
- `src/anws/lib/update.js`
- `/upgrade` workflow
- `.anws/vN/*` 演进流程

---

## 约束

1. changelog 必须持续可读、可追溯
2. 不允许因多工具适配引入模糊摘要，必须能定位影响边界
3. 不允许将 changelog 降级为单纯的终端输出副产物

---

## 参考

- `genesis/v3/03_ADR/ADR_003_CHANGELOG_SYSTEM.md`（目录协议升级前版本）
- `genesis/v4/01_PRD.md`（目录协议语义对应 `.anws/v4/01_PRD.md`）
