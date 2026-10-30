import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

test('validation accepts the CV and rejects an empty endDate with a field error', async () => {
  const valid = spawnSync(process.execPath, ['validate.mjs'], { encoding: 'utf8' })
  assert.equal(valid.status, 0, valid.stderr)

  const dir = await mkdtemp(join(tmpdir(), 'resume-validation-'))
  try {
    const resume = JSON.parse(await readFile('resume.json', 'utf8'))
    resume.work[0].endDate = ''
    const file = join(dir, 'invalid.json')
    await writeFile(file, JSON.stringify(resume))
    const invalid = spawnSync(process.execPath, ['validate.mjs', file], { encoding: 'utf8' })
    assert.equal(invalid.status, 1)
    assert.match(invalid.stderr, /work\[0\]\.endDate/)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})
