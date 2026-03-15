'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { detectInstalledTarget, detectInstalledTargets, getTarget, listTargets } = require('../lib/adapters');

async function withTempDir(run) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'anws-adapters-'));
  try {
    await run(tempDir);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

test('detectInstalledTarget returns windsurf when .windsurf layout exists', async () => {
  await withTempDir(async (tempDir) => {
    await fs.mkdir(path.join(tempDir, '.windsurf', 'workflows'), { recursive: true });

    const target = await detectInstalledTarget(tempDir);

    assert.equal(target.id, 'windsurf');
  });
});

test('detectInstalledTarget returns codex when .codex layout exists', async () => {
  await withTempDir(async (tempDir) => {
    await fs.mkdir(path.join(tempDir, '.codex', 'skills'), { recursive: true });

    const target = await detectInstalledTarget(tempDir);

    assert.equal(target.id, 'codex');
  });
});

test('detectInstalledTarget returns null when no supported layout exists', async () => {
  await withTempDir(async (tempDir) => {
    const target = await detectInstalledTarget(tempDir);

    assert.equal(target, null);
  });
});

test('listTargets exposes all supported target contracts', () => {
  const targets = listTargets();

  assert.equal(targets.length, 6);
  assert(targets.every((target) => target.id));
  assert(targets.every((target) => target.label));
  assert(targets.every((target) => target.projectionTypes));
  assert(targets.every((target) => target.projections));
  assert(targets.every((target) => Array.isArray(target.detect)));
});

test('listTargets covers the complete first-wave target matrix', () => {
  assert.deepEqual(
    listTargets().map((target) => target.id),
    ['windsurf', 'antigravity', 'cursor', 'claude', 'copilot', 'codex']
  );
});

test('getTarget returns copilot projection contract', () => {
  const target = getTarget('copilot');

  assert.deepEqual(target.projectionTypes.workflow, ['agents', 'prompts']);
  assert.deepEqual(target.projectionTypes.skill, ['prompts']);
  assert.equal(target.projections.agents, '.github/agents');
});

test('getTarget reports supported targets for unsupported ids', () => {
  assert.throws(
    () => getTarget('unknown'),
    /Unsupported target: unknown\. Supported targets:/
  );
});

test('getTarget returns stable detection metadata for all supported targets', () => {
  for (const target of listTargets()) {
    const resolved = getTarget(target.id);

    assert.equal(resolved.id, target.id);
    assert.equal(typeof resolved.rootAgentFile, 'boolean');
    assert(resolved.detect.length > 0);
    assert(resolved.detect.every((item) => typeof item === 'string' && item.length > 0));
  }
});

test('detectInstalledTargets returns multiple managed layouts when present', async () => {
  await withTempDir(async (tempDir) => {
    await fs.mkdir(path.join(tempDir, '.windsurf', 'workflows'), { recursive: true });
    await fs.mkdir(path.join(tempDir, '.codex', 'prompts'), { recursive: true });

    const targets = await detectInstalledTargets(tempDir);

    assert.deepEqual(targets.map((item) => item.id), ['windsurf', 'codex']);
  });
});

test('detectInstalledTargets can distinguish the full supported matrix from directory layout', async () => {
  await withTempDir(async (tempDir) => {
    await fs.mkdir(path.join(tempDir, '.windsurf', 'skills'), { recursive: true });
    await fs.mkdir(path.join(tempDir, '.agents', 'workflows'), { recursive: true });
    await fs.mkdir(path.join(tempDir, '.cursor', 'commands'), { recursive: true });
    await fs.mkdir(path.join(tempDir, '.claude', 'commands'), { recursive: true });
    await fs.mkdir(path.join(tempDir, '.github', 'agents'), { recursive: true });
    await fs.mkdir(path.join(tempDir, '.codex', 'skills'), { recursive: true });

    const targets = await detectInstalledTargets(tempDir);

    assert.deepEqual(
      targets.map((item) => item.id),
      ['windsurf', 'antigravity', 'cursor', 'claude', 'copilot', 'codex']
    );
  });
});
