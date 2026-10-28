import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { test } from 'node:test'
import { pathToFileURL } from 'node:url'
import puppeteer from 'puppeteer'

const resume = JSON.parse(await readFile('resume.json', 'utf8'))

test('generated HTML includes the CV and hides the download button in print', { timeout: 30000 }, async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  try {
    const page = await browser.newPage()
    await page.goto(pathToFileURL(resolve('index.html')).href, { waitUntil: 'networkidle0' })
    const text = await page.evaluate(() => document.body.textContent)
    assert.ok(text.includes(resume.basics.name), 'Missing candidate name')
    assert.ok(text.includes(resume.basics.label), 'Missing headline')
    assert.ok(text.includes(resume.basics.summary), 'Missing summary')
    assert.ok(text.includes(' - Present'), 'Missing current-role indicator')
    for (const job of resume.work) {
      assert.ok(job.name, 'Employer must use the JSON Resume work.name field')
      assert.ok(text.includes(job.name), `Missing employer: ${job.name}`)
      assert.ok(text.includes(job.position), `Missing role: ${job.position}`)
      for (const highlight of job.highlights ?? []) {
        assert.ok(text.includes(highlight), `Missing highlight for ${job.name}`)
      }
    }
    for (const project of resume.projects ?? []) {
      assert.ok(text.includes(project.name), `Missing project: ${project.name}`)
      assert.ok(text.includes(project.description), `Missing description: ${project.name}`)
    }
    for (const school of resume.education ?? []) {
      assert.ok(text.includes(school.institution), `Missing school: ${school.institution}`)
    }
    for (const certificate of resume.certificates ?? []) {
      assert.ok(text.includes(certificate.name), `Missing certificate: ${certificate.name}`)
    }
    for (const skill of resume.skills ?? []) {
      for (const keyword of skill.keywords ?? []) {
        assert.ok(text.includes(keyword), `Missing skill: ${keyword}`)
      }
    }
    assert.equal(await page.$$eval('#download-pdf', els => els.length), 1)
    assert.equal(await page.$eval('#download-pdf', el => el.href),
      'https://github.com/tonyputi/resume/releases/latest/download/resume.pdf')
    assert.notEqual(await page.$eval('#download-pdf', el => getComputedStyle(el).display), 'none')
    await page.emulateMediaType('print')
    assert.equal(await page.$eval('#download-pdf', el => getComputedStyle(el).display), 'none')
  } finally {
    await browser.close()
  }
})

test('generated PDF is a nonempty, complete PDF file', async () => {
  const pdf = await readFile('resume.pdf')
  assert.ok(pdf.length > 10000, 'PDF is unexpectedly small')
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-')
  assert.ok(pdf.subarray(-100).toString().includes('%%EOF'), 'PDF is truncated')
})
