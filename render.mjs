import { readFile, writeFile } from 'fs/promises'
import { render } from 'jsonresume-theme-data-driven'

const resume = JSON.parse(await readFile('resume.json', 'utf8'))
const html = await render(resume)

await writeFile('index.html', html)
console.log('Rendered index.html with jsonresume-theme-data-driven')
