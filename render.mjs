import { readFile, writeFile } from 'fs/promises'
import { createRequire } from 'module'

// The data-driven theme ships a JSX entry point under its package `import`
// condition, which the `resumed` CLI tries (and fails) to load directly.
// We bypass that by requiring the compiled `dist` build and calling its
// `render` function ourselves.
const require = createRequire(import.meta.url)
const theme = require('jsonresume-theme-data-driven/dist')

const resume = JSON.parse(await readFile('resume.json', 'utf8'))
const html = await theme.render(resume)

await writeFile('index.html', html)
console.log('Rendered index.html with jsonresume-theme-data-driven')
