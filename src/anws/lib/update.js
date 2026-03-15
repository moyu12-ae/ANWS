'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { buildProjectionPlan } = require('./manifest');
const { getTarget } = require('./adapters');
const { planAgentsUpdate, resolveAgentsInstall, printLegacyMigrationWarning, pathExists } = require('./agents');
const { collectManagedFileDiffs, printPreview } = require('./diff');
const { detectUpgrade, generateChangelog } = require('./changelog');
const { writeTargetFiles } = require('./copy');
const { createInstallLock, dedupeTargets, detectInstallState, summarizeTargetState, writeInstallLock } = require('./install-state');
const { ROOT_AGENTS_FILE, resolveCanonicalSource } = require('./resources');
const { success, warn, error, info, fileLine, skippedLine, blank, logo } = require('./output');

async function update(options = {}) {
  const cwd = process.cwd();
  const check = !!options.check;
  const legacyAgentDir = path.join(cwd, '.agent');
  const { version } = require(path.join(__dirname, '..', 'package.json'));
  const installState = await detectInstallState(cwd);
  const selectedTargetIds = installState.selectedTargets;
  const targetPlans = buildProjectionPlan(selectedTargetIds);

  const legacyAgentExists = await pathExists(legacyAgentDir);
  const isLegacyMigration = selectedTargetIds.length === 0 && legacyAgentExists;

  if (selectedTargetIds.length === 0 && !legacyAgentExists) {
    logo();
    error('No supported Anws target layout found in current directory.');
    info('Run `anws init` first to set up the workflow system.');
    process.exit(1);
  }

  const srcAgents = ROOT_AGENTS_FILE;

  if (isLegacyMigration) {
    logo();
    blank();
    info('Legacy .agent/ directory detected.');
    info('anws update will migrate managed files into the Antigravity target structure.');
    info('Your old .agent/ directory will be preserved for manual review.');
    blank();
  }

  const versionState = await detectUpgrade({ cwd, version });
  const targetContexts = [];

  for (const targetPlan of targetPlans) {
    const target = getTarget(targetPlan.targetId);
    const agentsDecision = target.id === 'antigravity'
      ? await resolveAgentsInstall({
        cwd,
        askMigrate,
        forceYes: !!global.__ANWS_FORCE_YES
      })
      : {
        shouldWriteRootAgents: false,
        shouldWarnMigration: false,
        rootExists: false,
        legacyExists: false
      };

    if (!agentsDecision.shouldWriteRootAgents && agentsDecision.legacyExists) {
      info('Keeping legacy .agent/rules/agents.md. Will not pull root AGENTS.md.');
    }
    if (agentsDecision.shouldWarnMigration) {
      printLegacyMigrationWarning();
    }

    let agentsUpdatePlan = null;
    if (agentsDecision.shouldWriteRootAgents && agentsDecision.rootExists) {
      const templateContent = await fs.readFile(srcAgents, 'utf8');
      const existingContent = await fs.readFile(path.join(cwd, 'AGENTS.md'), 'utf8');
      agentsUpdatePlan = planAgentsUpdate({ templateContent, existingContent });

      if (agentsUpdatePlan.warning) {
        warn(agentsUpdatePlan.warning);
      }
    }

    const rawChanges = await collectManagedFileDiffs({
      cwd,
      projectionPlan: [targetPlan],
      srcAgents,
      shouldWriteRootAgents: agentsDecision.shouldWriteRootAgents,
      agentsUpdatePlan
    });
    const changes = rawChanges.filter((item) => {
      if (item.file !== 'AGENTS.md') return true;
      if (agentsUpdatePlan && agentsUpdatePlan.mode === 'skip') return false;
      return agentsDecision.shouldWriteRootAgents;
    });

    targetContexts.push({
      target,
      targetPlan,
      agentsDecision,
      agentsUpdatePlan,
      changes
    });
  }

  const changes = targetContexts.flatMap((context) => context.changes);

  if (check) {
    if (!versionState.needUpgrade) {
      if (!isLegacyMigration) {
        logo();
        blank();
      }
      info(`Already up to date. Latest recorded version is v${versionState.latestVersion || version}.`);
      printTargetSelection(installState, targetContexts.map((context) => context.target));
      return;
    }
    if (!isLegacyMigration) {
      logo();
      blank();
    }
    printTargetSelection(installState, targetContexts.map((context) => context.target));
    printPreview({
      fromVersion: versionState.fromVersion,
      toVersion: versionState.toVersion,
      changes
    });
    return;
  }

  if (!versionState.needUpgrade) {
    if (!isLegacyMigration) {
      logo();
      blank();
    }
    info(`Already up to date. Latest recorded version is v${versionState.latestVersion || version}.`);
    printTargetSelection(installState, targetContexts.map((context) => context.target));
    return;
  }

  const confirmed = await askUpdate(targetContexts.map((context) => context.target));
  if (!confirmed) {
    blank();
    info('Aborted. No files were changed.');
    return;
  }

  if (!isLegacyMigration) {
    logo();
  }
  printTargetSelection(installState, targetContexts.map((context) => context.target));
  const updated = [];
  const skipped = [];
  const successfulTargets = [];

  for (const context of targetContexts) {
    const result = await writeTargetFiles(cwd, {
      targetPlan: context.targetPlan,
      protectedFiles: context.targetPlan.userProtectedFiles,
      srcAgents,
      shouldWriteRootAgents: context.agentsDecision.shouldWriteRootAgents,
      resolveCanonicalSource
    });

    updated.push(...result.written);
    skipped.push(...result.skipped);
    successfulTargets.push(summarizeTargetState(context.targetPlan, version));
  }

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

  const changelogPath = await generateChangelog({ cwd, version, changes });
  const generatedAt = new Date().toISOString();
  await writeInstallLock(cwd, createInstallLock({
    cliVersion: version,
    generatedAt,
    targets: dedupeTargets([
      ...(installState.lockResult.lock?.targets || []),
      ...successfulTargets
    ]),
    lastUpdateSummary: {
      successfulTargets: successfulTargets.map((item) => item.targetId),
      failedTargets: [],
      updatedAt: generatedAt
    }
  }));

  blank();
  success(`Done! ${updated.length} file(s) updated${skipped.length > 0 ? `, ${skipped.length} skipped` : ''}.`);
  info('Managed files have been updated to the latest version.');
  info('Your custom files outside the selected target projections were not touched.');
  if (isLegacyMigration) {
    info('Legacy .agent/ was preserved. You can review and delete it manually after migration.');
    const deleted = await maybeDeleteLegacyDir(legacyAgentDir);
    if (deleted) {
      info('Legacy .agent/ directory was deleted after confirmation.');
    }
  }
  info(`Generated upgrade record: ${path.relative(cwd, changelogPath).replace(/\\/g, '/')}`);
  info('Run `/upgrade` in your AI IDE to update your architecture docs.');
}

async function askUpdate(targets) {
  if (global.__ANWS_FORCE_YES) return true;

  if (!process.stdin.isTTY) {
    warn('Non-TTY environment detected. Skipping update to avoid accidental overwrites.');
    return false;
  }

  const readline = require('node:readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    rl.question(
      `\n⚠ This will overwrite all managed files for: ${targets.map((target) => target.label).join(', ')}. Continue? [y/N] `,
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'y');
      }
    );
  });
}

async function askMigrate() {
  if (global.__ANWS_FORCE_YES) return true;

  if (!process.stdin.isTTY) {
    return false;
  }

  const readline = require('node:readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    rl.question(
      '\n⚠ Legacy .agent/ directory detected. Do you want to migrate to .agents/? [y/N] ',
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'y');
      }
    );
  });
}

async function maybeDeleteLegacyDir(legacyAgentDir) {
  const exists = await pathExists(legacyAgentDir);
  if (!exists) return false;

  if (global.__ANWS_FORCE_YES) {
    return false;
  }

  if (!process.stdin.isTTY) {
    return false;
  }

  const readline = require('node:readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const shouldDelete = await new Promise((resolve) => {
    rl.question(
      '\n⚠ Legacy .agent/ directory has been preserved. Delete it now? [y/N] ',
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'y');
      }
    );
  });

  if (!shouldDelete) return false;

  await fs.rm(legacyAgentDir, { recursive: true, force: true });
  return true;
}

function printTargetSelection(installState, targets) {
  blank();
  info(`Matched targets: ${targets.map((target) => `${target.label} (${target.id})`).join(', ') || 'none'}`);
  if (installState.needsFallback) {
    info('State source: directory scan fallback');
  } else {
    info('State source: install-lock + directory scan');
  }
  if (installState.drift.hasDrift) {
    warn(`State drift detected. Missing on disk: ${installState.drift.missingOnDisk.join(', ') || 'none'}; untracked on disk: ${installState.drift.untrackedOnDisk.join(', ') || 'none'}.`);
  }
}

module.exports = update;
