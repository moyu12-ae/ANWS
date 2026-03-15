'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MANAGED_FILES,
  USER_PROTECTED_FILES,
  buildManagedManifest,
  buildProjectionPlan,
  buildProjectionEntries,
  buildManagedFiles,
  findByType
} = require('../lib/manifest');
const { listTargets } = require('../lib/adapters');

test('legacy MANAGED_FILES stays aligned with antigravity target', () => {
  assert.deepEqual(MANAGED_FILES, buildManagedFiles('antigravity'));
});

test('windsurf managed files map workflows and skills into .windsurf', () => {
  const files = buildManagedFiles('windsurf');

  assert(files.includes('.windsurf/workflows/genesis.md'));
  assert(files.includes('.windsurf/skills/spec-writer/SKILL.md'));
  assert(!files.includes('AGENTS.md'));
});

test('codex managed files include prompts and skills', () => {
  const files = buildManagedFiles('codex');

  assert(files.includes('.codex/prompts/genesis.md'));
  assert(files.includes('.codex/skills/spec-writer/SKILL.md'));
});

test('copilot managed files include prompts and agents', () => {
  const files = buildManagedFiles('copilot');

  assert(files.includes('.github/prompts/genesis.md'));
  assert(files.includes('.github/agents/genesis.md'));
});

test('buildProjectionEntries uses target projection metadata for cursor commands', () => {
  const entries = buildProjectionEntries('cursor');

  assert(entries.some((item) => item.outputPath === '.cursor/commands/genesis.md'));
  assert(entries.some((item) => item.outputPath === '.cursor/commands/spec-writer.md'));
});

test('buildManagedManifest groups ownership by target and preserves antigravity root agent file', () => {
  const manifest = buildManagedManifest(['antigravity', 'codex']);

  assert(manifest.some((item) => item.targetId === 'antigravity' && item.outputPath === 'AGENTS.md'));
  assert(manifest.some((item) => item.targetId === 'codex' && item.outputPath === '.codex/prompts/genesis.md'));
  assert(manifest.every((item) => typeof item.ownershipKey === 'string' && item.ownershipKey.length > 0));
});

test('buildManagedManifest rejects unsupported targets with supported list', () => {
  assert.throws(
    () => buildManagedManifest('unknown'),
    /Unsupported target: unknown\. Supported targets:/
  );
});

test('user protected files are target-aware', () => {
  assert.deepEqual(USER_PROTECTED_FILES, ['AGENTS.md']);
  assert.deepEqual(buildManagedFiles('windsurf').filter((item) => USER_PROTECTED_FILES.includes(item)), []);
});

test('resource registry exposes workflows and skills', () => {
  const workflows = findByType('workflow');
  const skills = findByType('skill');

  assert(workflows.some((item) => item.id === 'genesis'));
  assert(skills.some((item) => item.id === 'spec-writer'));
});

test('all supported targets expose the expected projection shapes', () => {
  const expectedByTarget = {
    windsurf: ['.windsurf/workflows/genesis.md', '.windsurf/skills/spec-writer/SKILL.md'],
    antigravity: ['AGENTS.md', '.agents/workflows/genesis.md', '.agents/skills/spec-writer/SKILL.md'],
    cursor: ['.cursor/commands/genesis.md', '.cursor/commands/spec-writer.md'],
    claude: ['.claude/commands/genesis.md', '.claude/commands/spec-writer.md'],
    copilot: ['.github/agents/genesis.md', '.github/prompts/genesis.md', '.github/prompts/spec-writer.md'],
    codex: ['.codex/prompts/genesis.md', '.codex/skills/spec-writer/SKILL.md']
  };

  for (const target of listTargets()) {
    const files = buildManagedFiles(target.id);
    const entries = buildProjectionEntries(target.id);
    const plan = buildProjectionPlan(target.id)[0];

    for (const expectedPath of expectedByTarget[target.id]) {
      assert(files.includes(expectedPath), `${target.id} should manage ${expectedPath}`);
      assert(entries.some((item) => item.outputPath === expectedPath) || expectedPath === 'AGENTS.md');
    }

    assert.equal(plan.targetId, target.id);
    assert.equal(plan.targetLabel, target.label);
    assert.deepEqual(plan.managedFiles, files);
    assert(plan.ownership.every((item) => item.startsWith(`${target.id}:`)));
  }
});
