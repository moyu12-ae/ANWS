# ADR-007: Install Lock 与多目标 Update 编排

**状态**: Accepted
**日期**: 2026-03-15
**关联需求**: [REQ-004] [REQ-005] [REQ-006]
**关联版本**: .anws v6

---

## 背景

一旦 `anws` 支持同一项目安装多个 targets，`update` 就不能再只靠“看见某个目录就推断当前 target”这种单目标逻辑。项目中可能同时存在 `.windsurf/`、`.cursor/`、`.claude/`、`.github/`、`.codex/`、`.agents/` 等目录；如果没有显式状态记录，CLI 将无法可靠回答以下问题：

- 哪些 targets 是由 `anws` 正式安装的？
- 每个 target 当前由哪个版本安装？
- 每个 target 对应哪些受管投影文件？
- 当用户手动删改目录后，真实状态和预期状态如何对齐？

---

## 决策

采用 **Install Lock + Directory Scan Fallback** 模型：

1. 在项目内写入 `.anws/install-lock.json` 作为多目标安装状态的主要权威记录。
2. lock 中必须记录：
   - 已安装 target 列表
   - 安装版本
   - per-target managed projection 摘要
   - 最近一次成功更新结果摘要
3. `anws update` 的默认流程为：
   - 先读取 install lock
   - 再做目录扫描，用于发现漂移和缺失
   - 展示命中的 targets
   - 默认更新全部命中 targets
4. 多目标 `update` 允许 **部分成功**：
   - 成功 target 的结果保留
   - 失败 target 明确报告
   - lock 只回写成功 target 的最新状态

---

## 选择理由

- 让多目标安装拥有可解释、可审计、可恢复的状态真相
- 避免完全依赖目录扫描导致的误识别和语义漂移
- 保留目录扫描兜底，确保 lock 损坏时仍能恢复
- 为 `update --check`、changelog 与后续 remove/migrate 奠定统一状态模型

---

## 后果

### 正面

- `update` 的扫描结果更稳定
- 可支持 per-target 差异预览与结果汇总
- 后续可以自然扩展 remove / repair / migrate 能力

### 代价

- 需要维护额外状态文件
- 需要定义 lock 漂移修复规则
- 需要明确部分成功时的回写与汇总语义

---

## 约束

1. install lock 是主要状态真相，目录扫描仅作兜底，不得长期替代 lock
2. lock 中的 per-target managed ownership 必须能支持独立更新与独立报错
3. 多目标 `update` 的输出必须按 target 分组，不能只给出全局模糊结论
4. 允许部分成功，但不得把失败 target 的状态误写成成功
