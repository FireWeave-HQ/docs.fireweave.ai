# Repository audit

**Task:** 001  
**Date:** 2026-08-17  
**Workspace:** `/Users/niketh/Coding/docs.fireweave.ai`  
**GitHub:** https://github.com/FireWeave-HQ/docs.fireweave.ai  
**Intended Mintlify host:** https://docs.fireweave.ai  

This audit records what exists in the repository today. It does not invent FireWeave APIs, product behavior, or Mintlify configuration beyond what is already on disk.

## Verdict

The repository is **nearly empty of FireWeave documentation**, but it is **not an empty git repo**. It is a stock **Mintlify Starter Kit** (single commit `b5f2616`, message `Initial commit`) with placeholder pages, Mintlify branding, and starter config.

Treat the starter as a scaffold to customize, not as content to keep verbatim. Do not delete the Mintlify config shape (`docs.json`, MDX + frontmatter, `logo/` + `favicon.svg` paths, `.mintignore`, `AGENTS.md` conventions) without a replacement.

## Git

| Item | Value |
|------|--------|
| Current branch | `main` |
| Tracking | `origin/main` (up to date at audit time) |
| Working tree before this audit's writes | clean |
| Local branches | `main` only |
| Remote branches | `origin/main` only (`origin/HEAD` → `origin/main`) |
| Tags | none |
| Commits | 1 — `b5f2616` *Initial commit* (author Niketh Sabbineni, 2026-08-17) |
| Remote | `git@github.com:FireWeave-HQ/docs.fireweave.ai.git` |
| Default branch | `main` |
| Branch protection | none |
| GitHub visibility | public |
| GitHub description | empty |
| GitHub Actions workflows | 0 |
| Issues / Projects / Wiki | enabled (defaults; unused for docs content) |

No other feature branches exist locally or on the remote.

## File tree

Tracked files at `HEAD` (10 files). No `audits/` directory existed before this audit.

```
.
├── .mintignore
├── AGENTS.md
├── LICENSE
├── README.md
├── docs.json
├── favicon.svg
├── index.mdx
├── logo
│   ├── dark.svg
│   └── light.svg
└── quickstart.mdx
```

**Absent (confirmed):**

| Expected / common | Status |
|-------------------|--------|
| `.gitignore` | missing |
| `.github/` (Actions, CODEOWNERS, PR template) | missing |
| `package.json` / lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lock`) | missing |
| `mint.json` (legacy Mintlify config) | missing — current config is `docs.json` |
| `node_modules/` | missing (CLI is expected globally via `npm i -g mint`) |
| CI config (GitHub Actions, Circle, etc.) | missing |
| `.editorconfig`, `.nvmrc`, `.node-version`, `Makefile` | missing |
| `images/`, `snippets/`, `api-reference/`, `essentials/`, `drafts/` | missing |
| FireWeave product docs, SDK pages, terminology | missing |
| Custom CSS / fonts | missing |

## Existing configuration

### `docs.json` — Mintlify site config (KEEP SHAPE, REPLACE BRANDING)

Present. Schema: `https://mintlify.com/docs.json`. This is the current Mintlify config format (not `mint.json`).

| Key | Current value | Notes |
|-----|---------------|-------|
| `theme` | `mint` | Starter default |
| `name` | `Mintlify Starter Kit` | Must become FireWeave later (task 006) |
| `colors.primary` | `#16A34A` | Mintlify green, not FireWeave |
| `colors.light` | `#07C983` | |
| `colors.dark` | `#15803D` | |
| `favicon` | `/favicon.svg` | Points at starter Mintlify mark |
| `navigation.pages` | group **Getting Started** → `index`, `quickstart` | Placeholder nav |
| `navigation.global.anchors` | Mintlify docs + Mintlify blog | Overwrite risk: leftover Mintlify marketing links |
| `logo.light` / `logo.dark` | `/logo/light.svg`, `/logo/dark.svg` | Mintlify wordmarks |
| `navbar.links` | Support → `mailto:hi@mintlify.com` | Starter |
| `navbar.primary` | button **Dashboard** → `https://app.mintlify.com` | Starter |
| `contextual.options` | copy, view, chatgpt, claude, perplexity, mcp, cursor, vscode | Useful default — preserve unless research (032) says otherwise |
| `footer.socials` | Mintlify x / github / linkedin | Starter |

**Convention to preserve:** single root `docs.json`; page IDs are paths without `.mdx`.

### `.mintignore`

Present. Comments document that Mintlify already ignores `.git`, `.github`, `.claude`, `.agents`, `.idea`, `node_modules`, `README.md`, `LICENSE.md`, `CHANGELOG.md`, `CONTRIBUTING.md`.

Repo-specific ignores:

```
drafts/
*.draft.mdx
```

**Keep.** Extend later if audit/internal files should stay out of the published site (for example `audits/`, `TASKS.md`, `DOCUMENTATION_GAPS.md` — confirm with Mintlify research / task 006).

### No package manager

No Node/Python/Go project files. Local preview is documented as a global CLI (`npm i -g mint`, then `mint dev`). There is nothing to lock or install in-repo today.

### No CI

No `.github/workflows`. Publishing is described in the starter README as: install the Mintlify GitHub app; pushes to the default branch deploy automatically. That GitHub app is **not** represented as files in this repo; whether it is connected in the Mintlify dashboard is out of scope for this file-system audit.

## Existing documentation

All page content is **Mintlify starter placeholder**. There is no FireWeave product documentation in this repository.

### `index.mdx`

- Frontmatter: title `Introduction`, description `Welcome to your project`
- Body: generic “write a short description of your product” plus a `<Tip>` and three `<Card>`s (Quickstart, Components, Settings)
- Components used: `Tip`, `Card`
- Links to `/quickstart` and Mintlify docs

### `quickstart.mdx`

- Frontmatter: title `Quickstart`, generic description
- Placeholder prerequisites
- `<Steps>` / `<Step>` with invented example commands (`npm install your-package`, `your-cli init`, `your-cli start`)
- Support tip with `support@yourcompany.com`

**Do not treat these pages as source of truth for FireWeave.** They are templates. Tasks 007 and 008 should replace the copy, not invent APIs to fill the placeholders.

## README

`README.md` is the **Mintlify Starter Kit** GitHub/Mintlify placeholder. It is not FireWeave documentation.

Summary of contents:

- How to copy the starter template
- Mentions of guide pages, navigation, customizations, API reference, components (those extra examples are **not** present in this checkout — this clone is a slim starter: two pages only)
- AI-assisted writing: `npx skills add https://mintlify.com/docs`
- Local dev: `npm i -g mint` then `mint dev` at the folder that contains `docs.json`; preview `http://localhost:3000`
- Publishing: Mintlify GitHub app; deploy on push to default branch
- Troubleshooting (`mint update`, 404 if no valid `docs.json`)
- Link to https://mintlify.com/docs

**Instruction:** note it; **do not replace it yet.**

## `AGENTS.md`

Mintlify-provided AI writing instructions. First-time-setup banner still present (“Customize this file for your project”).

Worth preserving as a convention file:

- Pages are MDX with YAML frontmatter
- Config lives in `docs.json`
- Mintlify MCP endpoints listed
- Style: active voice, second person, concise sentences, sentence-case headings, bold for UI, code formatting for files/commands/paths
- Empty placeholders for Terminology and Content boundaries (to be filled after task 004)

## License

`LICENSE` is **MIT**, copyright **(c) 2026 Mintlify**.

GitHub reports license key `mit`. Replacing copyright with FireWeave is a later legal/product decision — do not silently overwrite. The file is relevant to keep until that decision.

## Assets

| Path | What it is | Keep? |
|------|------------|--------|
| `favicon.svg` | Mintlify “M” mark (greens `#18E299`, `#0C8C5E`) | Path convention yes; artwork replace at branding time |
| `logo/light.svg` | Mintlify wordmark + “Starter Kit” label, dark text | Replace with FireWeave logos in task 006 |
| `logo/dark.svg` | Same wordmark, white text, “Starter Kit” label | Replace with FireWeave logos in task 006 |

No other images, icons, screenshots, or fonts.

## Conventions to preserve

1. **Mintlify v2 layout:** root `docs.json` + root-level (or grouped) `.mdx` pages.
2. **MDX + YAML frontmatter** (`title`, `description`).
3. **Dual logos** at `/logo/light.svg` and `/logo/dark.svg`, favicon at `/favicon.svg`.
4. **`.mintignore`** for drafts and Mintlify’s built-in ignores.
5. **`AGENTS.md`** as the in-repo writing/style contract (fill terminology later; do not discard the file).
6. **No in-repo `node_modules`** / no committed lockfile unless a later task adds a real package workflow.
7. **Sentence-case headings, second person, active voice** (from `AGENTS.md`).
8. **Single `main` branch** as the publish branch (starter README + GitHub default).

## What is empty vs what to keep

### Empty / placeholder (safe to replace when the owning task runs)

- Site name, colors, navbar, footer, and global anchors in `docs.json` (Mintlify branding)
- `index.mdx` and `quickstart.mdx` body copy
- Logo and favicon artwork (Mintlify marks)
- README body (placeholder — **do not replace in this task**)
- `AGENTS.md` terminology / content-boundary stubs
- LICENSE copyright holder (decision required)

### Keep (do not delete without a replacement)

- `docs.json` as the live config file (customize in place)
- `.mintignore`
- `AGENTS.md` file and its style rules
- `logo/` directory and the light/dark path contract
- `favicon.svg` path contract
- MIT `LICENSE` until legal says otherwise
- `README.md` until an explicit docs-README task
- Git history / `main` as default branch

## Risks of overwriting

| Action | Risk |
|--------|------|
| Recreating `docs.json` from scratch | Lose valid schema, contextual options, and nav structure; easy to break `mint dev` |
| Deleting `index.mdx` / `quickstart.mdx` before IA (005) | 404s if `docs.json` still points at them |
| Replacing logos without updating `docs.json` paths | Broken header/favicon |
| Adding a second config (`mint.json`) | Conflicting Mintlify config; this repo already uses `docs.json` |
| Replacing `README.md` now | Violates the “do not replace placeholder README yet” instruction |
| Overwriting `LICENSE` copyright without a decision | Legal/attribution issue |
| Publishing `audits/` or `TASKS.md` | Internal planning files may appear on the public docs site unless ignored (confirm in 006 / 032) |
| Inventing `.gitignore` / CI / package.json without a need | Extra surface area; not required for Mintlify’s documented global-CLI workflow |
| Assuming the starter README’s “API reference pages” exist | They do not exist in this clone |
| Treating placeholder `npm install your-package` as a real SDK | Invented API — forbidden |

## Validation performed

- `git status`, `git branch -a`, `git remote -v`, `git log`, `git ls-files`, `git show --stat HEAD`
- `git ls-remote --heads origin` and `--tags`
- Full `find` of the working tree excluding `.git`
- Read every tracked text file; inspected SVG assets
- `gh repo view` + Actions workflow count + branch protection + remote contents
- Confirmed no `.gitignore`, no `.github/`, no lockfiles, no `mint.json`

## Blockers

None for task 001. Downstream work is waiting on sibling audits (002, 003, 032), not on missing repo access.
