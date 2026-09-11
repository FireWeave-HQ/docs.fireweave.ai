# Example and link validation

**Date:** 2026-08-17
**Script:** `scripts/validate-examples.mjs`
**SDK checkout:** not found (used audited symbol lists)
**MDX files:** 39
**Fenced blocks:** 213

## Block counts by language

- `bash`: 41
- `ts`: 29
- `js`: 22
- `python`: 19
- `go`: 19
- `java`: 19
- `rust`: 18
- `hcl`: 13
- `json`: 12
- `mermaid`: 5
- `swift`: 3
- `http`: 3
- `yaml`: 2
- `text`: 2
- `xml`: 2
- `toml`: 2
- `powershell`: 1
- `(none)`: 1

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

- Node/TS compile skipped (no SDK checkout or npx).
- Python compile skipped: snippets are fragments; static import checks used.
- Go compile skipped: snippets omit go.mod replace; static import checks used.
- Java compile skipped: snippets omit Maven classpath; static import checks used.

## Result

**FAIL** — 36 error(s).


## Findings

- **ERROR** `concepts/adapters.mdx` L86: unknown node package import @fireweaveai/server-sdk
- **ERROR** `concepts/adapters.mdx` L112: unknown node package import @fireweaveai/server-sdk
- **ERROR** `concepts/control-points.mdx` L115: unknown node package import @fireweaveai/server-sdk
- **ERROR** `concepts/control-points.mdx` L141: unknown @fireweaveai/web-sdk export initFireweave
- **ERROR** `concepts/targeting.mdx` L144: Go has no RegisterTarget on master
- **ERROR** `concepts/targeting.mdx` L156: Java has no registerTarget on master
- **ERROR** `migration/v1.mdx` L48: unknown node package import @fireweaveai/server-sdk
- **ERROR** `migration/v1.mdx` L64: unknown node package import @fireweaveai/server-sdk
- **ERROR** `migration/v1.mdx` L90: unknown @fireweaveai/web-sdk export initFireweave
- **ERROR** `migration/v1.mdx` L113: unknown node package import @fireweaveai/server-sdk
- **ERROR** `migration/v1.mdx` L209: Go has no RegisterTarget on master
- **ERROR** `migration/v1.mdx` L225: Java has no registerTarget on master
- **ERROR** `openfeature.mdx` L29: unknown node package import @fireweaveai/server-sdk
- **ERROR** `openfeature.mdx` L43: unknown @fireweaveai/web-sdk export initFireweave
- **ERROR** `production/configuration.mdx` L46: unknown node package import @fireweaveai/server-sdk
- **ERROR** `production/configuration.mdx` L61: unknown @fireweaveai/web-sdk export initFireweave
- **ERROR** `quickstart.mdx` L43: unknown node package import npm:@fireweaveai/server-sdk
- **ERROR** `quickstart.mdx` L97: unknown node package import @fireweaveai/server-sdk
- **ERROR** `quickstart.mdx` L160: unknown @fireweaveai/web-sdk export initFireweave
- **ERROR** `quickstart.mdx` L204: Go has no RegisterTarget on master
- **ERROR** `quickstart.mdx` L215: Java has no registerTarget on master
- **ERROR** `quickstart.mdx` L386: unknown node package import @fireweaveai/server-sdk
- **ERROR** `quickstart.mdx` L443: unknown @fireweaveai/web-sdk export initFireweave
- **ERROR** `sdks/go.mdx` L37: unknown Go import github.com/FireWeave-HQ/fireweave-sdk/sdks/go/v2/fireweave
- **ERROR** `sdks/go.mdx` L105: Go has no RegisterTarget on master
- **ERROR** `sdks/java.mdx` L97: Java has no registerTarget on master
- **ERROR** `sdks/node.mdx` L36: unknown node package import npm:@fireweaveai/server-sdk
- **ERROR** `sdks/node.mdx` L46: unknown node package import @fireweaveai/server-sdk
- **ERROR** `sdks/node.mdx` L75: unknown node package import @fireweaveai/server-sdk
- **ERROR** `sdks/python.mdx` L39: unknown fireweave export init_fireweave
- **ERROR** `sdks/python.mdx` L54: unknown fireweave export init_fireweave
- **ERROR** `sdks/web.mdx` L37: unknown @fireweaveai/web-sdk export initFireweave
- **ERROR** `testing.mdx` L32: unknown node package import @fireweaveai/server-sdk
- **ERROR** `testing.mdx` L50: unknown @fireweaveai/web-sdk export initFireweave
- **ERROR** `testing.mdx` L117: unknown node package import @fireweaveai/server-sdk
- **ERROR** `migration/v1.mdx`: broken heading anchor /production/configuration#browser-keys-fw_public_ (no slug "browser-keys-fw_public_")

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

