# Fireweave docs

Source repository for Fireweave SDK documentation. Pages are MDX. Site config is `docs.json`. Mintlify builds and hosts the site.

The intended public hostname is `docs.fireweave.ai`. That hostname is **not** claimed live from this repo — custom domain setup is a Mintlify dashboard + DNS step. See `audits/mintlify-foundation-notes.md`.

Do not invent product APIs here. Writer tasks, the sitemap, and validation checkpoints live in [`TASKS.md`](TASKS.md).

This checkout started from the [Mintlify starter kit](https://github.com/mintlify/templates). The root `LICENSE` is MIT, copyright Mintlify 2026.

## Requirements

- Node.js **20.17+**
- Mintlify CLI package **`mint`** (not the old `mintlify` package)

```bash
npm i -g mint
```

`npx mint` also works without a global install.

## Local preview

From this directory (the folder that contains `docs.json`):

```bash
mint dev
```

Preview: [http://localhost:3000](http://localhost:3000).

Optional: `mint login` enables search and the assistant in local preview.

## Validate

```bash
mint validate
mint broken-links --check-anchors --check-redirects
```

Keep the CLI current with `mint update`.

## Publishing

Deploys are configured in the [Mintlify dashboard](https://app.mintlify.com) (Git Settings + GitHub App). Pushes to the connected default branch publish automatically after the app is installed. That connection is not represented as files in this repo.

## What is not published

`.mintignore` keeps internal files off the docs site, including `TASKS.md`, `audits/`, `DOCUMENTATION_GAPS.md`, `scripts/`, and `.github/`.
