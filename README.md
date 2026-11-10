# Fireweave docs

Source repository for FireWeave's documentation (docs.fireweave.ai). Pages are MDX. Site config is `docs.json`. Mintlify builds and hosts the site.

Do not invent product APIs here. Every page is written from the `main` branches of `fireweaveai-platform` (its knowledge base, `docs/kb/`) and `fireweave-sdk`. See [`AGENTS.md`](AGENTS.md) for the writing rules and the house diagram components.

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

`.mintignore` keeps internal files off the docs site, including `drafts/`, `scripts/` and `.github/`.
