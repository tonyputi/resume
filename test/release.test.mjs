import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { test } from 'node:test'

const require = createRequire(import.meta.url)
const config = require('../release.config.cjs')

test('release publishes notes and the PDF without writing to the branch', () => {
  assert.deepEqual(config.plugins, [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/github', { assets: ['resume.pdf'] }],
  ])
})
