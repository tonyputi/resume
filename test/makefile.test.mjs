import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

test('Make delegates commands and guards local releases without publishing', t => {
  const root = mkdtempSync(join(tmpdir(), 'cv-make-test-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const repo = join(root, 'repo')
  const bin = join(root, 'bin')
  const log = join(root, 'calls.log')
  mkdirSync(repo)
  mkdirSync(bin)
  writeFileSync(join(repo, 'Makefile'), readFileSync(new URL('../Makefile', import.meta.url)))
  writeFileSync(join(repo, 'tracked.txt'), 'original\n')
  for (const command of ['npm', 'npx']) {
    writeFileSync(join(bin, command), `#!/bin/sh\nprintf '%s\\n' '${command} '"$*" >> "$CALL_LOG"\nexit "\${CHECK_EXIT:-0}"\n`, { mode: 0o755 })
  }
  const git = (...args) => execFileSync('git', [
    '-c', 'core.hooksPath=/dev/null', '-c', 'commit.gpgsign=false', ...args,
  ], { cwd: repo, encoding: 'utf8', stdio: 'pipe' })
  git('init', '-b', 'main')
  git('config', 'user.name', 'Release Test')
  git('config', 'user.email', 'test@example.invalid')
  git('add', '.')
  git('commit', '-m', 'fixture')
  git('init', '--bare', join(root, 'origin.git'))
  git('remote', 'add', 'origin', join(root, 'origin.git'))
  git('push', '-u', 'origin', 'main')

  const run = (target, extraEnv = {}) => {
    writeFileSync(log, '')
    const result = spawnSync('make', target ? [target] : [], {
      cwd: repo,
      encoding: 'utf8',
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, CALL_LOG: log, MAKEFLAGS: '', MFLAGS: '', ...extraEnv },
    })
    return { ...result, calls: readFileSync(log, 'utf8'), output: result.stdout + result.stderr }
  }
  const blocked = message => {
    const result = run('release')
    assert.notEqual(result.status, 0, result.output)
    assert.ok(result.output.includes(message), result.output)
    assert.equal(result.calls, '', 'A rejected release must not build or publish')
  }

  for (const [target, expected] of [
    [undefined, 'npm run check\n'],
    ['build', 'npm run build\n'],
    ['pdf', 'npm run build\nnpm run pdf\n'],
    ['check', 'npm run check\n'],
    ['release', 'npm run check\nnpx --no-install semantic-release --no-ci\n'],
  ]) {
    const result = run(target)
    assert.equal(result.status, 0, result.output)
    assert.equal(result.calls, expected)
  }

  writeFileSync(join(repo, 'tracked.txt'), 'modified\n')
  blocked('clean working tree')
  git('restore', 'tracked.txt')
  writeFileSync(join(repo, 'untracked.txt'), 'uncommitted\n')
  blocked('clean working tree')
  rmSync(join(repo, 'untracked.txt'))

  git('switch', '-c', 'feature')
  blocked('main branch')
  git('switch', 'main')
  git('commit', '--allow-empty', '-m', 'ahead')
  blocked('match origin/main')
  git('push', 'origin', 'main')
  git('reset', '--hard', 'HEAD^')
  blocked('match origin/main')
  git('reset', '--hard', 'origin/main')

  const failedCheck = run('release', { CHECK_EXIT: '1' })
  assert.notEqual(failedCheck.status, 0, failedCheck.output)
  assert.equal(failedCheck.calls, 'npm run check\n', 'Failed checks must stop publication')
})
