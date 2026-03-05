import { readFileSync, writeFileSync } from 'fs'

const PDF_URL = 'https://github.com/tonyputi/resume/releases/latest/download/resume.pdf'

const button = `
<style>
  #download-pdf {
    position: fixed;
    top: 24px;
    right: 24px;
    background: #56817A;
    color: #fff;
    padding: 10px 18px;
    border-radius: 6px;
    font-family: sans-serif;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    z-index: 9999;
    transition: background 0.2s;
  }
  #download-pdf:hover { background: #456b64; }
  @media print { #download-pdf { display: none; } }
</style>
<a id="download-pdf" href="${PDF_URL}" target="_blank">
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
  Download
</a>
`

let html = readFileSync('index.html', 'utf8')
html = html.replace('Open Source Projects', 'Private Projects')

html = html.replace('</body>', `${button}</body>`)
writeFileSync('index.html', html)
console.log('PDF link injected.')
