# 变更日志 - Genesis v2

> 此文件记录本版本迭代过程中的微调变更（由 /change 处理）。新增功能/任务需创建新版本（由 /genesis 处理）。

## 格式说明
- **[CHANGE]** 微调已有任务（由 /change 处理）
- **[FIX]** 修复问题
- **[REMOVE]** 移除内容

---

## 2026-02-25 - 初始化
- [ADD] 创建 Genesis v1 版本

---

## Wave 1 — `77277f2` + `d3dec29`
- [IMPL] T1.1.1: `src/anws/package.json` + `.npmignore`
- [IMPL] T2.1.1: `src/anws/templates/.agent/` (34 files)
- [IMPL] T2.1.2: `src/anws/lib/manifest.js` (MANAGED_FILES, 34 entries)

## Wave 2 — `596b835`
- [IMPL] T1.2.5: `src/anws/lib/copy.js` — `copyDir(src, dest) → string[]`
- [IMPL] T1.2.1: `src/anws/bin/cli.js` — shebang + parseArgs + routing
- [IMPL] T1.2.2 + T1.2.3: `src/anws/lib/init.js` — init + conflict detection (inline)
- [IMPL] T1.2.4: `src/anws/lib/update.js` — update command

## Wave 3 — `a36d540`
- [IMPL] T1.3.1: `src/anws/lib/output.js` — ANSI color helpers, TTY/NO_COLOR detection
- [CHANGE] T1.3.1: Integrated output.js into bin/cli.js, lib/init.js, lib/update.js
- [IMPL] T2.2.1: `src/anws/README.md` — install, commands, conflict handling, Node ≥18
- [VERIFIED] T1.3.2: Windows smoke test passed (--version, --help, init 34 files, update non-TTY)
