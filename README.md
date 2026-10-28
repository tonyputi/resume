# Filippo Sallemi — CV

Personal CV maintained as [JSON Resume](https://jsonresume.org/) data and generated as a static website and an A4 PDF.

- [Live CV](https://filippo.sallemi.it/)
- [Download the latest released PDF](https://github.com/tonyputi/resume/releases/latest/download/resume.pdf)

## Local development

Use Node.js **22.22.2+ within the 22.x line**, or **24.15+**, npm and Make. CI uses Node 22.

```sh
npm ci          # Install locked dependencies and Puppeteer's browser
make check      # Validate data, build HTML/PDF, run tests (also the default: make)
npm run dev     # Build and open index.html (macOS)
```

The Makefile is a small entry point over the existing npm scripts:

| Command | Effect |
| --- | --- |
| `make build` | Render `index.html` and add the PDF download button |
| `make pdf` | Rebuild HTML, then generate `resume.pdf` |
| `make check` | Validate data, build HTML/PDF and run tests; does not publish |
| `make release` | Check release preconditions, run checks, then publish a GitHub release if commits warrant one |

The npm scripts remain available directly. `npm run validate` checks `resume.json` with the official `@jsonresume/schema@1.7.0` validator (draft-07), before the build in `npm run check` and CI. `npm run validate -- /path/to/copy.json` checks another file. The schema is bundled locally; validation does not fetch the `$schema` URL. Keep that versioned URL aligned with the dependency. `npm run pdf` alone uses the existing HTML; `node --test` alone expects existing outputs without regenerating them.

Run commands from the repository root. Puppeteer downloads Chromium during installation; PDF generation requires its platform libraries on Linux. The browser runs without its sandbox for CI compatibility: use only trusted resume data and templates.

## Files and content updates

| File | Purpose |
| --- | --- |
| `resume.json` | Source of truth for CV content; employer names use `work[].name` |
| `Makefile` | Build, PDF, checks and guarded local release commands |
| `validate.mjs` | Validate original JSON Resume data; report field errors and exit nonzero on failure |
| `render.mjs` | Render HTML using `jsonresume-theme-data-driven` |
| `inject-pdf-link.mjs` | Add the download action, hidden when printing |
| `generate-pdf.mjs` | Print A4 PDF with margins and section-break overrides |
| `test/smoke.test.mjs` | Check content rendering, download action and PDF integrity |
| `release.config.cjs` | Conventional Commit release rules and PDF release asset |
| `.github/workflows/deploy.yml` | PR checks and main-branch release/deployment |
| `AGENTS.md` | Guidance for Pi and other coding agents |

Edit `resume.json`, then run `make check` and inspect `index.html` and `resume.pdf`. Omit `work[].endDate` for current roles; only the rendering copy supplies the empty string needed by the theme to display “Present”. Do not hand-edit generated HTML/PDF files; they are ignored by Git. Schema validation and smoke tests do not replace a visual review.

## Website deployment and PDF releases

These are separate operations:

- **Production website:** [Cloudflare Pages](https://resume-zrf.pages.dev/) automatically builds the `resume` project from pushes to `main` and serves `filippo.sallemi.it`. Pull requests receive preview deployments. This integration does not consume GitHub Actions minutes.
- **PDF release:** `semantic-release` uses Conventional Commits (`fix:` for patches, `feat:` for minor releases), updates `CHANGELOG.md`, creates a GitHub release and attaches `resume.pdf` only to that new release. Non-release commits do not overwrite existing PDF assets.
- **GitHub Actions:** runs checks on PRs and, on `main`, can publish releases and a separate GitHub Pages copy. That copy is not the production domain and may lag when Actions is skipped or minutes are exhausted.

### Release locally without Actions minutes

After merging and syncing `main`, install dependencies with `npm ci`, then run:

```sh
make release
```

**This publishes a real release**, not a preview. It requires a clean tree (including untracked files), the `main` branch, HEAD matching freshly fetched `origin/main`, authenticated Git pushes and a `GH_TOKEN` or `GITHUB_TOKEN` with repository/release write access. It runs `make check` before `semantic-release --no-ci`; build/test failure stops publication. It does not deploy the HTML website or publish to npm. Do not run it while an automated release is in progress.

`CHANGELOG.md` belongs to release automation. The package is private; `package.json`'s version is not the release version. The website may be newer than the latest released PDF after a non-release push.

### Skip only GitHub Actions, not Cloudflare

When Actions minutes must be conserved, add the `skip-checks: true` trailer to the final commit pushed to `main` (including a squash merge commit). Precede it with **two empty lines** and preserve them with `git commit --cleanup=verbatim`:

```text
chore: describe the change


skip-checks: true
```

Do **not** use `[skip ci]` for a source update that Cloudflare must deploy: Cloudflare also honors it. The automated changelog-only release commit may keep `[skip ci]` because it does not change the site. Skipping Actions does not skip the need for local `make check`.

## Infrastructure and work tracking

Track content, rendering and local build/release tooling in [this repository's issues](https://github.com/tonyputi/resume/issues). Keep technical maintenance separate from editorial CV changes.

Cloudflare infrastructure is owned by **[tonyputi/terraform](https://github.com/tonyputi/terraform)**. Open infrastructure issues [there](https://github.com/tonyputi/terraform/issues), linking the affected CV issue when relevant:

- `config/cloudflare/pages.yaml`, entry `resume`: Pages/Git integration, production branch and build settings.
- `config/cloudflare/zones.yaml`: DNS and zone settings.
- `cloudflare.tf` and `modules/cloudflare/pages/`: Terraform wiring and Pages resource implementation.

Do not change managed infrastructure in the Cloudflare dashboard, add local Wrangler configuration or run Terraform from this CV repository. Infrastructure changes need a separate review/plan in the Terraform repository.
