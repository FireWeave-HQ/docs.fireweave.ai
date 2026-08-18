# Mintlify CLI validation (checkpoint 9)

**Date:** 2026-08-17  
**Host Node:** v25.2.1 (unsupported by `mint`)  
**CLI Node used:** v20.19.4 (official darwin-arm64 binary, `/tmp/node20/…`, not a system nvm/fnm install)

`npx mint` on Node 25 failed immediately: `mintlify is not supported on node 25`.

With Node 20.19.4 + `npm i -g mint`:

| Command | Result |
|---------|--------|
| `mint validate` | **PASS** (after fixing MDX parse of unescaped `<0.11` in `sdks/compatibility.mdx`) |
| `mint broken-links --check-anchors --check-redirects` | **PASS** — no broken links found |

CI already runs the same commands on Node 20.17: `.github/workflows/docs-validate.yml`.

`mint preview` / dashboard connect were **not** run. Do not claim `docs.fireweave.ai` is live.
