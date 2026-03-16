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

## 2026-03-16 - AGENTS Root Install 修复与 Trae/Qoder 适配研判
- [FIX] 修复 `init` 仅为 `antigravity` 初始化根目录 `AGENTS.md` 的问题；现在所有已支持 target 在初始化时都会同步根目录 `AGENTS.md`
- [FIX] 修复多 target 初始化时共享 `AGENTS.md` 被后续 target 误判为冲突的问题；同一轮 `init` 中已写出的共享根文件不再阻塞后续 target
- [CHANGE] 将 `windsurf`、`cursor`、`claude`、`copilot`、`codex`、`opencode` 的 `rootAgentFile` 统一打开，使 `manifest`/`init`/`install-lock` 对根目录 `AGENTS.md` 的处理一致
- [CHANGE] 同步更新 `manifest` 与 `init.integration` 相关测试基线，验证单 target、多 target、partial success 场景下的 `AGENTS.md` 行为
- [CHANGE] 记录 Trae / Qoder 适配方向，作为下一步 target 扩展输入：
  - `Trae`：当前研判更接近 **skills-only** 模型，工作流需要折叠进 `SKILL.md`，不宜直接沿用独立 `workflows/` 目录语义
  - `Qoder`：可优先按 **commands** 体系适配，项目级目录可直接投影到 `<project>/.qoder/commands/`
- [CHANGE] 本条记录仅覆盖本次修 bug 之后的增量，不追溯此前 codex / opencode 历史变更

### 研究来源
- `Trae` 需求草案与结构假设：`d:\PROJECTALL\Workflow\note.txt`
- `Trae` 官方文档入口：`https://docs.trae.cn/cli/skills`
- `Trae` 官方文档入口（IDE Skills）：`https://docs.trae.cn/ide/skills`
- `Qoder` 官方文档：`https://docs.qoder.com/zh/user-guide/commands`
