import puppeteer from 'puppeteer'
import { resolve } from 'path'

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

const page = await browser.newPage()
await page.goto(`file://${resolve('index.html')}`, { waitUntil: 'networkidle0' })
await page.pdf({
  path: 'resume.pdf',
  format: 'A4',
  printBackground: true,
})

await browser.close()
console.log('PDF generated: resume.pdf')
