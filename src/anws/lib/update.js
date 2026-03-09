'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { MANAGED_FILES, USER_PROTECTED_FILES } = require('./manifest');
const { success, warn, error, info, fileLine, skippedLine, blank, logo } = require('./output');

/**
 * anws update — 将当前项目的托管文件更新到最新版本
 */
async function update() {
  const cwd = process.cwd();
  const agentDir = path.join(cwd, '.agent');

  // 检查 .agent/ 是否存在
  const agentExists = await fs.access(agentDir).then(() => true).catch(() => false);
  if (!agentExists) {
    logo();
    error('No .agent/ found in current directory.');
    info('Run `anws init` first to set up the workflow system.');
    process.exit(1);
  }

  // 询问确认
  const confirmed = await askUpdate();
  if (!confirmed) {
    blank();
    info('Aborted. No files were changed.');
    process.exit(0);
  }

  logo();
  // 仅覆盖托管文件；USER_PROTECTED_FILES 永远跳过
  const srcRoot = path.join(__dirname, '..', 'templates', '.agent');
  let skipNewAgentsMd = false;
  
  const legacyAgentsPath = path.join(cwd, '.agent', 'rules', 'agents.md');
  const legacyExists = await fs.access(legacyAgentsPath).then(() => true).catch(() => false);
  const rootAgentsPath = path.join(cwd, 'AGENTS.md');
  const rootExists = await fs.access(rootAgentsPath).then(() => true).catch(() => false);

  if (legacyExists && !rootExists) {
    const migrate = await askMigrate();
    if (!migrate) {
      skipNewAgentsMd = true;
      info('Keeping legacy .agent/rules/agents.md. Will not pull root AGENTS.md.');
    } else {
      blank();
      warn('Please manually copy your custom rules from .agent/rules/agents.md to the new root AGENTS.md');
      warn('After copying, you can safely delete the old .agent/rules/agents.md file.');
      blank();
    }
  }

  const updated = [];
  const skipped = [];

  for (const rel of MANAGED_FILES) {
    if (skipNewAgentsMd && rel === 'AGENTS.md') {
      continue;
    }

    if (USER_PROTECTED_FILES.includes(rel)) {
      skipped.push(rel);
      continue;
    }

    const srcPath = path.join(path.dirname(srcRoot), rel);
    const destPath = path.join(cwd, rel);

    const srcExists = await fs.access(srcPath).then(() => true).catch(() => false);
    if (!srcExists) continue;

    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.copyFile(srcPath, destPath);
    updated.push(rel);
  }

  // 打印摘要
  blank();
  info('Updated files:');
  blank();
  for (const rel of updated) {
    fileLine(rel.replace(/\\/g, '/'));
  }
  if (skipped.length > 0) {
    blank();
    info('Skipped (project-specific, preserved):');
    for (const rel of skipped) {
      skippedLine(rel.replace(/\\/g, '/'));
    }
  }

  blank();
  success(`Done! ${updated.length} file(s) updated${skipped.length > 0 ? `, ${skipped.length} skipped` : ''}.`);
  info('Managed files have been updated to the latest version.');
  info('Your custom files in .agent/ were not touched.');
}

/**
 * 交互式确认更新操作（默认 N）。
 */
async function askUpdate() {
  if (global.__ANWS_FORCE_YES) return true;

  if (!process.stdin.isTTY) {
    warn('Non-TTY environment detected. Skipping update to avoid accidental overwrites.');
    return false;
  }

  const readline = require('node:readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    rl.question(
      '\n\u26a0 This will overwrite all managed .agent/ files. Continue? [y/N] ',
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'y');
      }
    );
  });
}

/**
 * 询问用户是否同意迁移 agents.md
 */
async function askMigrate() {
  if (global.__ANWS_FORCE_YES) return true;

  if (!process.stdin.isTTY) {
    return false;
  }

  const readline = require('node:readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    rl.question(
      '\n\u26a0 Legacy .agent/rules/agents.md detected. Do you want to migrate to root AGENTS.md? [y/N] ',
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'y');
      }
    );
  });
}

module.exports = update;
