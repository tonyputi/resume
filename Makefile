.DEFAULT_GOAL := check

.PHONY: build pdf check release

build:
	npm run build

pdf: build
	npm run pdf

check:
	npm run check

release:
	@test "$$(git branch --show-current)" = main || { echo "Release requires the main branch." >&2; exit 1; }
	@test -z "$$(git status --porcelain)" || { echo "Release requires a clean working tree, including untracked files." >&2; exit 1; }
	git fetch origin
	@test "$$(git rev-parse HEAD)" = "$$(git rev-parse origin/main)" || { echo "Release requires HEAD to match origin/main; sync your checkout first." >&2; exit 1; }
	$(MAKE) check
	npx --no-install semantic-release --no-ci
