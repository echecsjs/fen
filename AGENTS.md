# AGENTS.md

Agent guidance for the `@echecs/fen` package — FEN parser/serialiser.

**See also:** [`REFERENCES.md`](REFERENCES.md) |
[`COMPARISON.md`](COMPARISON.md)

See the root `AGENTS.md` for workspace-wide conventions.

**Backlog:** tracked in [GitHub Issues](https://github.com/echecsjs/fen/issues).

---

## Project Overview

Parses FEN (Forsyth–Edwards Notation) strings into `Position` objects and
serialises them back. Default export `parse()` never throws — returns `null` on
failure. Named export `stringify()` always succeeds.

API mirrors `@echecs/trf`.

---

## Validation

Input validation is mostly provided by TypeScript's strict type system at
compile time. There is no runtime validation library — the type signatures
enforce correct usage. Do not add runtime type-checking guards (e.g. `typeof`
checks, assertion functions) unless there is an explicit trust boundary.

---

## Architecture Notes

- **ESM-only** — the package ships only ESM. Do not add a CJS build.
- Use `.js` extensions on all relative imports (NodeNext resolution).

---

## Commands

```bash
pnpm build && pnpm test && pnpm lint
```

---

## Release Protocol

Step-by-step process for releasing a new version. CI auto-publishes to npm when
`version` in `package.json` changes on `main`.

1. **Verify the package is clean:**

   ```bash
   pnpm lint && pnpm test && pnpm build
   ```

   Do not proceed if any step fails.

2. **Decide the semver level:**
   - `patch` — bug fixes, internal refactors with no API change
   - `minor` — new features, new exports, non-breaking additions
   - `major` — breaking changes to the public API

3. **Update `CHANGELOG.md`** following
   [Keep a Changelog](https://keepachangelog.com) format:

   ```markdown
   ## [x.y.z] - YYYY-MM-DD

   ### Added

   - …

   ### Changed

   - …

   ### Fixed

   - …

   ### Removed

   - …
   ```

   Include only sections that apply. Use past tense.

4. **Update `README.md`** if the release introduces new public API, changes
   usage examples, or deprecates/removes existing features.

5. **Bump the version:**

   ```bash
   npm version <major|minor|patch> --no-git-tag-version
   ```

6. **Open a release PR:**

   ```bash
   git checkout -b release/x.y.z
   git add package.json CHANGELOG.md README.md
   git commit -m "release: @echecs/fen@x.y.z"
   git push -u origin release/x.y.z
   gh pr create --title "release: @echecs/fen@x.y.z" --body "<description>"
   ```

   Wait for CI (format, lint, test) to pass on the PR before merging.

7. **Merge the PR:** Once CI is green, merge (squash) into `main`. The release
   workflow detects the version bump, publishes to npm, and creates a GitHub
   Release with a git tag.

Do not manually publish with `npm publish`. Do not create git tags manually —
the release workflow handles tagging.
