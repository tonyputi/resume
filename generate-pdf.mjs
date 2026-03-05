import puppeteer from 'puppeteer'
import { resolve } from 'path'

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

const page = await browser.newPage()
await page.goto(`file://${resolve('index.html')}`, { waitUntil: 'networkidle0' })

await page.addStyleTag({
  content: `
    .resume-content {
      display: grid !important;
      grid-template-columns: 160px 1fr !important;
      grid-template-rows: auto !important;
      align-items: start !important;
    }
    .left-column {
      float: none !important;
      width: auto !important;
      grid-column: 1 !important;
    }
    .right-column {
      grid-column: 2 !important;
      width: auto !important;
    }
  `
})

await page.pdf({
  path: 'resume.pdf',
  format: 'A4',
  printBackground: true,
})

await browser.close()
console.log('PDF generated: resume.pdf')
