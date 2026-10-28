import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { renderMetadata } from '../metadata.mjs'

const { basics } = JSON.parse(await readFile('resume.json', 'utf8'))

test('metadata escapes HTML and script delimiters and rejects insecure canonical URLs', () => {
  const name = 'A & B "$&" \'</title><script>alert(1)</script>'
  const summary = 'A </script><img src=x onerror=alert(1)> & "quoted" profile. Another sentence.'
  const html = renderMetadata({ ...basics, name, summary })
  const script = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]
  assert.ok(html.includes('A &amp; B &quot;$&amp;&quot; &#39;&lt;/title&gt;'))
  assert.ok(!html.includes('<img'))
  assert.equal((html.match(/<script\b/g) ?? []).length, 1)
  assert.ok(!script.includes('<'))
  assert.equal(JSON.parse(script).mainEntity.name, name)
  assert.equal(JSON.parse(script).mainEntity.description, summary)
  assert.throws(() => renderMetadata({ ...basics, url: 'http://example.com/' }), /HTTPS/)
})

test('PNG assets match the declared favicon, touch icon and social-image dimensions', async () => {
  for (const [file, width, height] of [
    ['favicon.png', 96, 96], ['apple-touch-icon.png', 180, 180], ['social-preview.png', 1200, 630],
  ]) {
    const png = await readFile(`assets/${file}`)
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', file)
    assert.equal(png.readUInt32BE(16), width, file)
    assert.equal(png.readUInt32BE(20), height, file)
  }
})
