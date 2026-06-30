import puppeteer from 'puppeteer'
import { resolve } from 'path'

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

const page = await browser.newPage()
await page.goto(`file://${resolve('index.html')}`, { waitUntil: 'networkidle0' })

// Each <section> ships with `page-break-inside: avoid`. When a whole section
// fits on one page, Chromium keeps it intact and pushes it to the next page
// rather than splitting it — which left a tall section (e.g. Experience) jumping
// wholesale to page 2 and stranding page 1 nearly empty. Let sections break
// across pages, but keep the individual item blocks (jobs, entries) intact so
// they are never cut mid-entry.
await page.addStyleTag({
  content: `
    section {
      break-inside: auto !important;
    }
  `
})

// Page margins apply to every printed page, giving consistent breathing room
// at the top/bottom on continuation pages — without them the content runs
// edge-to-edge and pages 2+ start glued to the top of the sheet.
await page.pdf({
  path: 'resume.pdf',
  format: 'A4',
  printBackground: true,
  margin: { top: '14mm', bottom: '14mm', left: '12mm', right: '12mm' },
})

await browser.close()
console.log('PDF generated: resume.pdf')
