# Filippo Sallemi — CV

Personal CV maintained as [JSON Resume](https://jsonresume.org/) data and generated as a static website and an A4 PDF.

- [Live CV](https://tonyputi.github.io/resume/)
- [Download the latest released PDF](https://github.com/tonyputi/resume/releases/latest/download/resume.pdf)

## Local development

Use Node.js **22.22.2+ within the 22.x line**, or **24.15+**, and npm. CI uses Node 22.

```sh
npm ci          # Install locked dependencies and Puppeteer's browser
npm run check   # Build HTML, generate PDF, run smoke tests
npm run dev     # Build and open index.html (macOS)
```

Individual commands:

```sh
npm run build   # Render index.html and add the PDF download button
npm run pdf     # Generate resume.pdf from the existing index.html
node --test     # Check existing HTML/PDF outputs without regenerating them
```

Run commands from the repository root. Puppeteer downloads Chromium during installation; PDF generation requires its platform libraries on Linux. The browser runs without its sandbox for CI compatibility: use only trusted resume data and templates.

## Files and content updates

| File | Purpose |
| --- | --- |
| `resume.json` | Source of truth for CV content; employer names use `work[].name` |
| `render.mjs` | Render HTML using `jsonresume-theme-data-driven` |
| `inject-pdf-link.mjs` | Add the download action, hidden when printing |
| `generate-pdf.mjs` | Print A4 PDF with margins and section-break overrides |
| `test/smoke.test.mjs` | Check content rendering, download action and PDF integrity |
| `release.config.cjs` | Conventional Commit release rules and PDF release asset |
| `.github/workflows/deploy.yml` | PR checks and main-branch release/deployment |
| `AGENTS.md` | Guidance for Pi and other coding agents |

Edit `resume.json`, then run `npm run check` and inspect `index.html` and `resume.pdf`. Do not hand-edit generated HTML/PDF files; they are ignored by Git. Smoke tests check rendering but do **not** replace full JSON Resume schema validation or a visual review.

## Automation and work tracking

Track work in [GitHub Issues](https://github.com/tonyputi/resume/issues). Keep technical maintenance separate from editorial changes to the CV.

Pull requests run the same `npm run check` used locally. On pushes to `main`, the workflow builds and checks once, then:

1. Stages **only `index.html`** for GitHub Pages.
2. Passes the generated PDF to `semantic-release`, which creates releases according to Conventional Commits (`fix:` for patches, `feat:` for minor releases).
3. Attaches `resume.pdf` **only to a newly created release**. Non-release pushes do not overwrite previous PDF assets.
4. Deploys the checked site artifact to GitHub Pages after the release job succeeds.

`CHANGELOG.md` is maintained by release automation. The package is private and is not published to npm; `package.json`'s version is not the release version. The website may be newer than the latest released PDF after a non-release push.
