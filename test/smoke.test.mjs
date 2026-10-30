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
    const head = await page.evaluate(() => ({
      title: document.title,
      titleCount: document.head.querySelectorAll('title').length,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      meta: Object.fromEntries([...document.head.querySelectorAll('meta[name], meta[property]')]
        .map(element => [element.name || element.getAttribute('property'), element.content])),
      icons: [...document.head.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]')]
        .map(element => element.getAttribute('href')),
      profile: JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent),
    }))
    const canonical = new URL(resume.basics.url).href
    const title = `${resume.basics.name} — ${resume.basics.label}`
    const [intro] = new Intl.Segmenter('en', { granularity: 'sentence' }).segment(resume.basics.summary)
    const description = intro.segment.trim()
    const image = new URL('assets/social-preview.png', canonical).href
    const imageAlt = `${resume.basics.name} — Simpler systems. Stronger teams. Engineering leadership, AI architecture.`
    assert.equal(head.titleCount, 1)
    assert.equal(head.title, title)
    assert.equal(head.canonical, canonical)
    for (const [key, value] of Object.entries({
      description, author: resume.basics.name,
      'og:type': 'profile', 'og:title': title, 'og:description': description,
      'og:url': canonical, 'og:site_name': `${resume.basics.name} — CV`,
      'og:image': image, 'og:image:type': 'image/png',
      'og:image:width': '1200', 'og:image:height': '630', 'og:image:alt': imageAlt,
      'twitter:card': 'summary_large_image', 'twitter:title': title,
      'twitter:description': description, 'twitter:image': image, 'twitter:image:alt': imageAlt,
    })) assert.equal(head.meta[key], value, `Incorrect metadata: ${key}`)
    assert.deepEqual(head.icons, ['assets/favicon.png', 'assets/favicon.svg', 'assets/apple-touch-icon.png'])
    assert.equal(head.profile['@context'], 'https://schema.org')
    assert.equal(head.profile['@type'], 'ProfilePage')
    assert.equal(head.profile.url, canonical)
    assert.equal(head.profile.mainEntity['@type'], 'Person')
    assert.equal(head.profile.mainEntity.name, resume.basics.name)
    assert.equal(head.profile.mainEntity.jobTitle, resume.basics.label)
    assert.equal(head.profile.mainEntity.description, resume.basics.summary)
    assert.deepEqual(head.profile.mainEntity.sameAs, resume.basics.profiles.map(profile => profile.url))
    assert.equal(head.profile.mainEntity.image, undefined, 'Do not invent a person photo')
    assert.equal(await page.$$eval('#download-pdf', els => els.length), 1)
    assert.equal(await page.$eval('#download-pdf', el => el.href),
      'https://github.com/tonyputi/resume/releases/latest/download/resume.pdf')
    assert.notEqual(await page.$eval('#download-pdf', el => getComputedStyle(el).display), 'none')
    await page.emulateMediaType('print')
    assert.equal(await page.$eval('#download-pdf', el => getComputedStyle(el).display), 'none')
    const pdfScript = await readFile('generate-pdf.mjs', 'utf8')
    const printStyles = pdfScript.match(/content: `([\s\S]*?)`/)?.[1]
    assert.ok(printStyles, 'Missing PDF print styles')
    await page.addStyleTag({ content: printStyles })
    for (const skill of resume.skills ?? []) {
      const group = await page.evaluate(name => {
        const heading = [...document.querySelectorAll('section > div > strong')]
          .find(element => element.textContent === name)
        return heading && {
          breakInside: getComputedStyle(heading.parentElement).breakInside,
          hasTags: !!heading.parentElement.querySelector('div > span'),
        }
      }, skill.name)
      assert.deepEqual(group, { breakInside: 'avoid', hasTags: true }, `Unprotected skill group: ${skill.name}`)
    }
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
