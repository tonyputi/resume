import { readFile, writeFile } from 'fs/promises'

// The `resumed` CLI imports the theme's bare entry, which resolves to its JSX
// `import` condition and fails to load. We import the package's compiled `dist`
// subpath instead (its `import` condition points at plain compiled JS) and call
// its `render` function ourselves. Dynamic import keeps this working on any Node
// version — `require()` of this ESM-only package only works on Node >= 22.12.
const { render } = await import('jsonresume-theme-data-driven/dist')

const resume = JSON.parse(await readFile('resume.json', 'utf8'))
const html = await render(resume)

await writeFile('index.html', html)
console.log('Rendered index.html with jsonresume-theme-data-driven')
