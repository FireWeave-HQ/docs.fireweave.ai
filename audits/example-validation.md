# Example and link validation

**Date:** 2026-09-11
**Script:** `scripts/validate-examples.mjs`
**SDK checkout:** /tmp/fw-audit/sdk
**SDK layout:** v1
**MDX files:** 42
**Fenced blocks:** 222

## Block counts by language

- `bash`: 44
- `ts`: 29
- `js`: 23
- `python`: 19
- `go`: 19
- `java`: 19
- `rust`: 18
- `hcl`: 13
- `json`: 12
- `text`: 6
- `mermaid`: 5
- `swift`: 3
- `http`: 3
- `yaml`: 2
- `powershell`: 2
- `xml`: 2
- `toml`: 2
- `(none)`: 1

## Checks performed

- Node/Web named imports against `@fireweaveai/server-sdk` / `@fireweaveai/web-sdk` exports parsed from each SDK `index.ts` and package names from `package.json`
- Deno `npm:` specifiers accepted as aliases of the same package name
- Python `from fireweave…` modules and names against package `__all__` / public defs under `sdks/python/src`
- Go import paths must be a public package under the module in `sdks/go/go.mod` (currently `github.com/FireWeave-HQ/fireweave-sdk/sdks/go/v2`); pre-`/v2` paths are errors except on `migration/` pages
- Java `ai.fireweave.*` types walked from `sdks/java/*/src/main/java`
- Rust `use fireweave::…` names against `pub use` / `pub fn` in `sdks/rust/src/lib.rs`
- Swift `import Fireweave` plus Fireweave-prefixed symbols from `Sources/Fireweave`
- Forbidden invented APIs in fences: `fw.isOn`, `/fw-rollout`, `.track(`, `controlPointKey`
- Retired pre-v1 packages/symbols (`@fireweaveai/sdk`, OpenFeature providers, cut namespaces) rejected except on `migration/` pages
- Internal `href` / markdown links vs files on disk, `docs.json` nav, and heading slugs
- Frontmatter `title` + `description` on every MDX page
- No live API keys; no network evaluate calls

## Compile / typecheck

- Node/TS compile skipped: snippets are incomplete fragments (no shared harness). Static export checks used instead.
- Python compile skipped: snippets are fragments; static import checks used.
- Go compile skipped: snippets omit go.mod replace; static import checks used.
- Java compile skipped: snippets omit Maven classpath; static import checks used.
- Rust compile skipped: snippets omit Cargo harness; static import checks used.
- Swift compile skipped: snippets omit Package.swift harness; static import checks used.

## Result

**PASS** — no invented packages or broken internal links found.


## Findings

_None._

## Pages checked

- `cli/authentication.mdx`
- `cli/commands.mdx`
- `cli/overview.mdx`
- `concepts.mdx`
- `concepts/adapters.mdx`
- `concepts/capabilities.mdx`
- `concepts/control-points.mdx`
- `concepts/exposures.mdx`
- `concepts/releases.mdx`
- `concepts/signals.mdx`
- `concepts/targeting.mdx`
- `index.mdx`
- `infrastructure/terraform/authentication.mdx`
- `infrastructure/terraform/data-sources.mdx`
- `infrastructure/terraform/environments.mdx`
- `infrastructure/terraform/org-members.mdx`
- `infrastructure/terraform/overview.mdx`
- `infrastructure/terraform/projects.mdx`
- `infrastructure/terraform/quickstart.mdx`
- `introduction/architecture.mdx`
- `introduction/how-it-works.mdx`
- `migration/node-2.mdx`
- `migration/v1.mdx`
- `onboarding.mdx`
- `onboarding/first-change.mdx`
- `onboarding/setup.mdx`
- `openfeature.mdx`
- `production/configuration.mdx`
- `production/errors.mdx`
- `production/lifecycle.mdx`
- `quickstart.mdx`
- `reference/http-api.mdx`
- `reference/packages.mdx`
- `sdks/compatibility.mdx`
- `sdks/go.mdx`
- `sdks/java.mdx`
- `sdks/node.mdx`
- `sdks/python.mdx`
- `sdks/rust.mdx`
- `sdks/web.mdx`
- `testing.mdx`
- `troubleshooting.mdx`

