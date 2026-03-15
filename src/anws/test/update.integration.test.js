'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const cliPath = path.join(__dirname, '..', 'bin', 'cli.js');

async function withTempDir(run) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'anws-update-'));
  try {
    await run(tempDir);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

function runCliInDir(cwd, args) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
}

test('anws update --check detects the windsurf target layout', async () => {
  await withTempDir(async (tempDir) => {
    const initResult = runCliInDir(tempDir, ['init', '--target', 'windsurf']);
    assert.equal(initResult.status, 0, initResult.stderr || initResult.stdout);

    const checkResult = runCliInDir(tempDir, ['update', '--check']);

    assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
    assert.match(checkResult.stdout, /Already up to date|ANWS UPDATE PREVIEW/);
  });
});

test('anws update --check detects the antigravity target layout', async () => {
  await withTempDir(async (tempDir) => {
    const initResult = runCliInDir(tempDir, ['init', '--target', 'antigravity']);
    assert.equal(initResult.status, 0, initResult.stderr || initResult.stdout);

    const checkResult = runCliInDir(tempDir, ['update', '--check']);

    assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
    assert.match(checkResult.stdout, /Already up to date|ANWS UPDATE PREVIEW/);
  });
});

test('anws update --check detects multiple targets from install-lock and scan', async () => {
  await withTempDir(async (tempDir) => {
    const initResult = runCliInDir(tempDir, ['init', '--target', 'windsurf,codex']);
    assert.equal(initResult.status, 0, initResult.stderr || initResult.stdout);

    const checkResult = runCliInDir(tempDir, ['update', '--check']);

    assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
    assert.match(checkResult.stdout, /Matched targets:/);
    assert.match(checkResult.stdout, /Windsurf \(windsurf\)/);
    assert.match(checkResult.stdout, /Codex \(codex\)/);
  });
});

test('anws update falls back to directory scan when install-lock is missing', async () => {
  await withTempDir(async (tempDir) => {
    const initResult = runCliInDir(tempDir, ['init', '--target', 'windsurf']);
    assert.equal(initResult.status, 0, initResult.stderr || initResult.stdout);
    await fs.rm(path.join(tempDir, '.anws', 'install-lock.json'), { force: true });

    const checkResult = runCliInDir(tempDir, ['update', '--check']);

    assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
    assert.match(checkResult.stdout, /State source: directory scan fallback/);
    assert.match(checkResult.stdout, /Windsurf \(windsurf\)/);
  });
});

test('anws update keeps successful targets in lock and reports failed targets separately', async () => {
  await withTempDir(async (tempDir) => {
    const initResult = runCliInDir(tempDir, ['init', '--target', 'windsurf,codex']);
    assert.equal(initResult.status, 0, initResult.stderr || initResult.stdout);

    await fs.rm(path.join(tempDir, '.anws', 'changelog'), { recursive: true, force: true });
    await fs.rm(path.join(tempDir, '.codex', 'prompts'), { recursive: true, force: true });
    await fs.mkdir(path.join(tempDir, '.codex'), { recursive: true });
    await fs.writeFile(path.join(tempDir, '.codex', 'prompts'), 'blocked parent path', 'utf8');

    const updateResult = runCliInDir(tempDir, ['update', '--yes']);

    assert.equal(updateResult.status, 0, updateResult.stderr || updateResult.stdout);
    assert.match(updateResult.stdout, /Update summary by target:/);
    assert.match(updateResult.stdout, /Windsurf \(windsurf\)/);
    assert.match(updateResult.stdout, /Codex \(codex\)/);

    const lock = JSON.parse(await fs.readFile(path.join(tempDir, '.anws', 'install-lock.json'), 'utf8'));
    assert(lock.lastUpdateSummary.successfulTargets.includes('windsurf'));
    assert.deepEqual(lock.lastUpdateSummary.failedTargets, ['codex']);

    const changelogFiles = await fs.readdir(path.join(tempDir, '.anws', 'changelog'));
    const changelogFile = changelogFiles.find((name) => /^v\d+\.\d+\.\d+\.md$/.test(name));
    const changelog = await fs.readFile(path.join(tempDir, '.anws', 'changelog', changelogFile), 'utf8');
    assert.match(changelog, /成功 Targets/);
    assert.match(changelog, /失败 Targets/);
    assert.match(changelog, /Codex \(codex\)/);
  });
});
