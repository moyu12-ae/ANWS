# 变更日志 - Genesis v3

> 此文件记录本版本迭代过程中的微调变更（由 /change 处理）。新增功能/任务需创建新版本（由 /genesis 处理）。

## 格式说明
- **[CHANGE]** 微调已有任务（由 /change 处理）
- **[FIX]** 修复问题
- **[REMOVE]** 移除内容

---

## 2026-03-14 - 初始化
- [ADD] 基于 `genesis/v2` 演进创建 Genesis v3
- [ADD] 记录 `anws update` 的版本安全机制：同版本直接返回 "Already up to date."，不覆盖历史 changelog
- [ADD] 记录 `AGENTS.md` 的分区更新设计：稳定提示词区 + `AUTO` 运行态区块
- [ADD] 同步修正文档中的 changelog、diff 与 `/upgrade` 设计语义
