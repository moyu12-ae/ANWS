'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const cliPath = path.join(__dirname, '..', 'bin', 'cli.js');
const packageRoot = path.join(__dirname, '..');

function runCli(args, options = {}) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: packageRoot,
    encoding: 'utf8',
    ...options
  });
}

test('cli help documents the target option', () => {
  const result = runCli(['--help']);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /--target/);
  assert.match(result.stdout, /windsurf/);
  assert.match(result.stdout, /antigravity/);
});

test('cli exits with an error for unsupported target ids', () => {
  const result = runCli(['init', '--target', 'invalid-target'], {
    input: '',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr + result.stdout, /Unsupported target: invalid-target/);
});
