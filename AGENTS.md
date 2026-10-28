# Agent guidance

## Project and scope

This is Filippo Sallemi's personal CV, not an application framework. It uses Node.js ESM scripts, JSON Resume data, a third-party theme and Puppeteer. See `README.md` for commands and deployment details.

- `resume.json` is the content source of truth. Keep employer names in `work[].name` (not `company`); the theme silently omits the legacy field.
- Separate technical maintenance from content/positioning changes. Do not rewrite claims, roles, dates or personal details without an explicit request.
- Prefer small changes and existing/platform tooling. Do not fork the theme or add dependencies without a concrete need.
- Communicate with the maintainer in Italian unless requested otherwise. Ask questions one at a time.

## Work tracking

- Start with `git status --short` and `gh issue list --state open`; preserve unrelated changes.
- Use GitHub Issues for planned work and newly discovered technical problems. Reuse existing issues instead of duplicating them.
- Link work to its issue and record verification evidence and remaining risks. Do not mark unmerged/unverified work as deployed or complete.
- Use Conventional Commits: `fix:` and `feat:` trigger releases on `main`; `chore:` and `docs:` alone do not.
- Do not commit, push, publish releases or deploy unless the maintainer requests it.

## Checks and generated files

Run from the repository root with Node 22.22.2+ (22.x) or Node 24.15+:

```sh
npm ci
npm run check
npm audit
```

- `npm run check` builds HTML, prints PDF and runs Node's built-in smoke tests. Add a small regression test for nontrivial changes.
- `node --test` alone expects already-generated `index.html` and `resume.pdf`.
- Run `actionlint` for workflow changes when available; it is not an npm dependency.
- Smoke checks are not full JSON Resume schema validation. Inspect HTML/PDF visually for theme or print changes.
- Do not edit/commit generated `index.html`, PDFs, `_site/`, `node_modules/` or old local `resume-*.html` snapshots.
- After dependency changes, update `package-lock.json`, verify a clean `npm ci` and check audit findings. Document upstream/bundled vulnerabilities rather than forcing incompatible overrides.

## Release/deployment invariants

- Build and check before publishing; pass those same artifacts to release/deploy jobs.
- Let `@semantic-release/github` attach `resume.pdf` only when it creates a release. Never infer a new release from the latest existing Git tag or overwrite old release assets on non-release pushes.
- GitHub Pages must receive only the staged public site, never the repository root (which includes local config, source and dependencies).
- Keep permissions scoped to jobs. Cache npm downloads, not `node_modules`; always install from the lockfile.
- The PDF download URL points to the latest GitHub release, not a local PDF. Keep that URL, release asset name and smoke test aligned.
- `generate-pdf.mjs` deliberately lets sections span pages while keeping theme item blocks intact. Preserve its print margins and hidden download button.
- Puppeteer runs without a sandbox for CI compatibility. Do not use it to render untrusted HTML or templates.
- `CHANGELOG.md` belongs to release automation; package version metadata is not the release version.
