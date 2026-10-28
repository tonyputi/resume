# Agent guidance

## Project and scope

This is Filippo Sallemi's personal CV, not an application framework. It uses Node.js ESM scripts, JSON Resume data, a third-party theme and Puppeteer. See `README.md` for commands and deployment details.

- `resume.json` is the content source of truth. Keep employer names in `work[].name` (not `company`); the theme silently omits the legacy field.
- Separate technical maintenance from content/positioning changes. Do not rewrite claims, roles, dates or personal details without an explicit request.
- Prefer small changes and existing/platform tooling. Do not fork the theme or add dependencies without a concrete need.
- Communicate with the maintainer in Italian unless requested otherwise. Ask questions one at a time.

## Work tracking

- Start with `git status --short` and `gh issue list --state open`; preserve unrelated changes.
- Use this repository's GitHub Issues for CV content, rendering and local tooling. Cloudflare infrastructure issues belong in `tonyputi/terraform` (see below). Reuse existing issues and cross-link related work instead of duplicating it.
- Link work to its issue and record verification evidence and remaining risks. Do not mark unmerged/unverified work as deployed or complete.
- Use Conventional Commits: `fix:` and `feat:` warrant releases when semantic-release runs on `main`; `chore:` and `docs:` alone do not. Use `Closes #N` in PRs for fully resolved issues, and references only for partial work.
- Do not commit, push, publish releases or deploy unless the maintainer requests it.

## Checks and generated files

Run from the repository root with Node 22.22.2+ (22.x) or Node 24.15+:

```sh
npm ci
make check
npm audit
```

- The Makefile delegates to existing npm scripts: `make build` renders HTML, `make pdf` rebuilds HTML then PDF, and `make check` (also plain `make`) runs `npm run check`. CI can keep using npm directly.
- `npm run check` validates original `resume.json` data with the official `@jsonresume/schema` validator, builds HTML, prints PDF and runs Node's built-in tests. `npm run validate` runs validation alone. Keep the pinned validator version and `resume.json.$schema` URL aligned. Add a small regression test for nontrivial changes.
- `node --test` alone expects already-generated `index.html` and `resume.pdf`.
- Run `actionlint` for workflow changes when available; it is not an npm dependency.
- Omit `work[].endDate` for current roles; `render.mjs` supplies the theme's empty-string “Present” marker only in its rendering copy, never before validation. Inspect HTML/PDF visually for theme or print changes.
- Metadata comes from `resume.json` via `metadata.mjs`; keep canonical/social URLs on the production domain and do not invent dates, handles or a person photo. Escape HTML values and JSON-LD script delimiters. Brand SVG sources and their PNG exports in `assets/` are tracked; keep them synchronized.
- Do not edit/commit generated `index.html`, PDFs, `_site/`, `node_modules/` or old local `resume-*.html` snapshots.
- After dependency changes, update `package-lock.json`, verify a clean `npm ci` and check audit findings. Document upstream/bundled vulnerabilities rather than forcing incompatible overrides.

## Hosting and infrastructure ownership

- The production site is `https://filippo.sallemi.it/`, served by Cloudflare Pages project `resume` (`resume-zrf.pages.dev`). Its Git integration deploys `main` automatically and builds PR previews, independently of GitHub Actions minutes. This is Pages, not a Worker deployed from this repository.
- Infrastructure is managed in **[tonyputi/terraform](https://github.com/tonyputi/terraform)**. Open issues with `gh issue create --repo tonyputi/terraform` for DNS, custom domains, Pages/Git integration, production branch or infrastructure-level build settings. Do not create them in the CV repo; cross-link when an application change is also needed.
- Relevant Terraform paths: `config/cloudflare/pages.yaml` (entry `resume`), `config/cloudflare/zones.yaml` (DNS), `cloudflare.tf`, and `modules/cloudflare/pages/`. Inspect current Terraform configuration before proposing infrastructure changes; follow that repository's instructions.
- Do not change Terraform-managed settings manually in the Cloudflare dashboard, add Wrangler setup here, access Terraform state/secrets or run `terraform apply` as part of CV work.

## Release/deployment invariants

- Website deployment and PDF release are separate. Creating a GitHub release does not deploy HTML to Cloudflare.
- For a local release, use **`make release` only with explicit maintainer approval**. It requires a clean tree, `main` and HEAD matching freshly fetched `origin/main`, runs checks, then executes `npx --no-install semantic-release --no-ci`. It needs authenticated Git pushes and `GH_TOKEN` or `GITHUB_TOKEN`; never print or commit credentials. It publishes for real and does not install dependencies or deploy the website. Do not race it against an automated release.
- To conserve Actions minutes without blocking Cloudflare, use a final `skip-checks: true` trailer on the pushed/merged source commit, preceded by two empty lines. Preserve them with `git commit --cleanup=verbatim`; for squash merges, ensure the final merge message preserves the trailer. Generic `[skip ci]` also suppresses Cloudflare. The changelog-only release commit may retain that flag. Always run local checks before skipping CI.
- GitHub Actions still provides PR checks, automated releases and a separate GitHub Pages copy when not skipped. That copy is not the production domain and may be stale; do not report it as a successful Cloudflare deployment.
- Build and check before publishing; pass those same artifacts to release/deploy jobs.
- Let `@semantic-release/github` attach `resume.pdf` only when it creates a release. Never infer a new release from the latest existing Git tag or overwrite old release assets on non-release pushes.
- GitHub Pages must receive only `index.html` and `assets/` in the staged public site, never the repository root (which includes local config, source and dependencies).
- Keep permissions scoped to jobs. Cache npm downloads, not `node_modules`; always install from the lockfile.
- The PDF download URL points to the latest GitHub release, not a local PDF. Keep that URL, release asset name and smoke test aligned.
- `generate-pdf.mjs` deliberately lets sections span pages while keeping theme item blocks intact. Preserve its print margins and hidden download button.
- Puppeteer runs without a sandbox for CI compatibility. Do not use it to render untrusted HTML or templates.
- `CHANGELOG.md` belongs to release automation; package version metadata is not the release version.
