# 变更日志 - .anws v6

> 此文件记录本版本迭代过程中的微调变更（由 /change 处理）。新增功能/任务需创建新版本（由 /genesis 处理）。

## 格式说明
- **[CHANGE]** 微调已有任务（由 /change 处理）
- **[FIX]** 修复问题
- **[REMOVE]** 移除内容
- **[ADD]** 新增正式版本内容

---

## 2026-03-15 - 初始化
- [ADD] 创建 `.anws` v6 版本
- [ADD] 将产品模型从单目标 IDE 安装升级为同项目多目标显式安装
- [ADD] 拍板 `update` 扫描已安装 targets、展示扫描结果后默认统一更新的语义
- [ADD] 拍板共享 canonical source + target-specific projection + 独立落盘原则
- [ADD] 拍板 `.anws/install-lock.json` 作为多目标安装状态的权威记录
