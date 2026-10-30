import { readFile, writeFile } from 'fs/promises'
import { render } from 'jsonresume-theme-data-driven'
import { renderMetadata } from './metadata.mjs'

const resume = JSON.parse(await readFile('resume.json', 'utf8'))
// The theme needs an empty endDate to show Present; the schema requires omission.
const html = await render({
  ...resume,
  work: resume.work?.map(job => ({ endDate: '', ...job })),
})

const document = html.replace(/<title>[\s\S]*?<\/title>/, '')
  .replace('</head>', () => `${renderMetadata(resume.basics)}</head>`)
await writeFile('index.html', document)
console.log('Rendered index.html with jsonresume-theme-data-driven')
