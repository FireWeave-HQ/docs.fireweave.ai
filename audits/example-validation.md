# Example and link validation

**Date:** 2026-08-17
**Script:** `scripts/validate-examples.mjs`
**SDK checkout:** /tmp/fireweave-sdk
**MDX files:** 26
**Fenced blocks:** 186

## Block counts by language

- `ts`: 39
- `python`: 33
- `go`: 29
- `java`: 29
- `js`: 25
- `bash`: 18
- `mermaid`: 6
- `(none)`: 3
- `text`: 2
- `xml`: 2

## Checks performed

- Node/Web named imports against `@fireweaveai/sdk` / `@fireweaveai/web-sdk` export lists from `audits/sdk-audit.md` + `/tmp/fireweave-sdk` `index.ts`
- Python `from fireweave…` modules and names against `__all__` / extras
- Go import paths under `github.com/FireWeave-HQ/fireweave-sdk/sdks/go`
- Java `ai.fireweave.*` / OpenFeature / Jackson prefixes
- Forbidden invented APIs in fences: `fw.isOn`, `/fw-rollout`, `.track(`, `controlPointKey`
- Internal `href` / markdown links vs files on disk, `docs.json` nav, and heading slugs
- Frontmatter `title` + `description` on every MDX page
- No live API keys; no network evaluate calls

## Compile / typecheck

- Node/TS compile skipped: snippets are incomplete fragments (no shared harness). Static export checks used instead.
- Python compile skipped: snippets are fragments; static import checks used.
- Go compile skipped: snippets omit go.mod replace; static import checks used.
- Java compile skipped: snippets omit Maven classpath; static import checks used.

## Mintlify CLI (same checkpoint)

See `audits/mint-validation.md`. Host Node 25 cannot run `mint`. With Node 20.19.4: `mint validate` **PASS**, `mint broken-links --check-anchors --check-redirects` **PASS**.

## Result

**PASS** — no invented packages or broken internal links found.


## Findings

_None._

## Pages checked

- `concepts.mdx`
- `concepts/adapters.mdx`
- `concepts/capabilities.mdx`
- `concepts/control-points.mdx`
- `concepts/exposures.mdx`
- `concepts/releases.mdx`
- `concepts/signals.mdx`
- `concepts/targeting.mdx`
- `index.mdx`
- `introduction/architecture.mdx`
- `introduction/how-it-works.mdx`
- `migration/node-2.mdx`
- `openfeature.mdx`
- `production/configuration.mdx`
- `production/errors.mdx`
- `production/lifecycle.mdx`
- `quickstart.mdx`
- `reference/packages.mdx`
- `sdks/compatibility.mdx`
- `sdks/go.mdx`
- `sdks/java.mdx`
- `sdks/node.mdx`
- `sdks/python.mdx`
- `sdks/web.mdx`
- `testing.mdx`
- `troubleshooting.mdx`

