# Documentation gaps

**Task:** 031 (draft)  
**Date:** 2026-08-17  
**Status:** DONE — refined after user-facing pages exist (007–025, 033) and checkpoint-9 validation. Pages listed under “missing official-site coverage” now exist; remaining items are CONFIRMED GAP or NEEDS VERIFICATION, not missing files.

This file lists things official docs **cannot honestly document yet**, or must document only with a warning. It is not a place to invent filler pages.

Sources: `audits/sdk-audit.md` (003), `audits/existing-docs.md` (002), `audits/terminology.md` (004), `audits/information-architecture.md` (005), `audits/mintlify-platform.md` (032), `audits/repository-audit.md` (001).

---

## How to read this

| Class | Meaning |
|-------|---------|
| **CONFIRMED GAP** | Absence or mismatch is proven in `master` implementation, CHANGELOG, or recovered in-app copy. Safe to omit or to warn. Unsafe to invent. |
| **NEEDS VERIFICATION** | Sources disagree, or the answer lives on fw-server / console / registry and was not proven from the SDK repo. Do not guess in pages. |

---

## CONFIRMED GAP

### Packages and publish state

| Gap | Evidence | Docs implication |
|-----|----------|------------------|
| npm `latest` was **2.0.0** in audit 003; **live 2026-08-17: `latest` = 2.1.0** (2.0.0 still published) | Live npm; 003 §1 stale | Lead with `@fireweaveai/sdk@2.1.0`. Still warn that **2.0.0** has PostHog / `./posthog`. Node tarball `gitHead` is `fd19cad`, not audit `dfeb478` |
| Python `fireweave` **PyPI 0.1.0 published** (2026-08-17); audit 003 said unpublished | Live PyPI | `pip install 'fireweave[openfeature]'` is valid. Checkout remains an alternative |
| Go module unpublished (no verified public tag) | 003 §2.3, §7.15 | Checkout + `replace` only |
| Java `0.1.0-SNAPSHOT`, POM “DO NOT PUBLISH” | 003 §2.4 | Maven Central install is false |
| `@fireweaveai/web-sdk` **npm 2.1.0 published** (2026-08-17; `gitHead` dfeb478); audit 003 said unpublished | Live npm | `npm install @fireweaveai/web-sdk@2.1.0` is valid |
| Root README says Node “not yet published”; CHANGELOG lagged live tags | 003 §7.13 | Prefer **live registry** (2026-08-17: Node/Web/Python published) |
| License / package names await ratification | README; CHANGELOG | Do not tell customers to redistribute built packages |

### Language / API asymmetry

| Gap | Evidence | Docs implication |
|-----|----------|------------------|
| `registerTarget` / `register_target` **absent** in Go and Java on `master` | 003 §2.3–2.4, §8.1–8.2 | Language-gate targeting docs. Local Java parity branch is **not** source of truth |
| Go has **no** `controlPoints` namespace (`Flags()` only) | 003 §8.3 | |
| Java has **no** `controlPoints` / `flags` facade | 003 §8.3 | |
| Java native helpers are **boolean + string only** | 003 §2.4, §8.4 | Other types via `evaluate` or OpenFeature |
| Go native API is **only** `Flags().Evaluate` (no typed getters) | 003 §8.5 | |
| Node `./posthog` / `PostHogAdapter` **removed** in tree 2.1.0 | 003 §6, §8.6 | 2.0.0 users still have it — migration page only |
| Node in-process local evaluation removed | 003 §8.7 | Do not document secret-key poll on Node 2.1 |
| Web / Node: no vendor adapter | 003 §8.9 | |
| Java does **not** read `FW_*` from the environment | 003 §8.10 | |
| Web reads **no** environment | 003 §8.8 | |
| Web `client.ts` contains NUL bytes | 003 §7.14 | Tooling hazard; not an API gap |

### Evaluation and lifecycle behavior

| Gap | Evidence | Docs implication |
|-----|----------|------------------|
| `sendExposure` defaults **false** (all languages) | 003 §8.16 | Do not document emit-on-evaluate as default |
| Java `close()` / `runtime.shutdown()` **does not implicit-flush** | 003 §2.4, §3 | Explicit `exposures().flush()` required |
| OpenFeature Tracking (spec §6) **not implemented** | 003 §4, §8.12 | No `track` page or examples |
| Guardrails are a **typed stub** (`UnsupportedCapability`, `guardrails: false`) | 003 §8.11; SDK concepts | No working-guardrails guide. Conflicts with in-app auto-rollback copy |
| Java `PostHogAdapter.create(config)` → `UnsupportedCapability` | 003 §8.17 | |

### Test infrastructure vs SDK docs

| Gap | Evidence | Docs implication |
|-----|----------|------------------|
| Test-server does **not** implement `POST /v1/targets/register` | 003 §5, §8.13 | `docs/testing.md` in the SDK is **wrong**. Official testing page must not repeat that claim |
| Spec `remote-protocol.md` line 26 says register-target is “Node SDK only today” | Implementation also has Python + Web | Spec stale; docs follow implementation |

### In-app docs vs SDK (vocabulary and examples)

| Gap | Evidence | Docs implication |
|-----|----------|------------------|
| In-app product noun is **feature flag**; SDK/ADR-0007 is **control point** | 002 §3; 004 | Official site uses control point; explain `flagKey` duality |
| In-app wrap example `fw.isOn` | **ABSENT** in SDK `master` (004) | Never copy |
| In-app `/fw-rollout` | Not found in public plugin tree (002) | Do not document |
| In-app wrap-then-ramp vs marketing “promote, not wrap” | 002 §5 | No wrap guide in v1 (005) |
| In-app guardrail auto-rollback vs SDK stub | 002 §2.4; 003 | Do not resolve by inventing; omit console rollback as fact |
| `/alerts` anchor text vs runtime “Audit Logs” | 002 §4 | Do not link that UI from official docs until named correctly |
| Official docs repo **now has** FireWeave product pages matching the IA sitemap | Checkpoint 3–5 pages + 028–030 validation | Not a content gap. Custom domain / Mintlify dashboard still **NEEDS VERIFICATION** — do not claim `docs.fireweave.ai` is live |

### Official-site coverage (filled 2026-08-17)

IA INCLUDE pages now exist as MDX and are in `docs.json`. Remaining work is validation and publish-state freshness, not missing files:

- Production configuration, lifecycle, errors
- Per-language SDK pages including Web
- OpenFeature
- Testing / troubleshooting / Node 2.0→2.1 migration
- Targeting language gates
- Compatibility matrix

Do not treat this list as missing pages. IA: `audits/information-architecture.md`.

### Surfaces that do not exist

| Gap | Evidence |
|-----|----------|
| Mobile / React Native / iOS / Android / Rust / .NET / PHP / Ruby SDKs | 003 §8.14 — no packages under `sdks/` |
| Customer OpenAPI / REST reference in this repo | 001, 032 — do not invent a playground |
| CLI `fw` install that works | 002 — `get.fireweave.dev` DNS failed |
| Live `https://docs.fireweave.ai` | 002, 032 — DNS NXDOMAIN |

---

## NEEDS VERIFICATION

Do not turn these into API claims. Re-check before the matching page ships.

### Platform / fw-server

| Item | Why it is unverified | Blocks |
|------|----------------------|--------|
| Production hosts `app-server.fireweave.ai` / `staging-app-server.fireweave.ai` live, TLS, customer-facing URL | Named in Node allowlist only (003 §7.5) | Production URL examples |
| Whether fw-server issues scoped `fw_public_…` keys | Spec/ADR-0009: required platform work (003 §7.6) | Browser production guidance |
| Whether every language adapter sends `x-api-key` as well as Bearer | Spec accepts both; Node comments document Bearer (003 §7.7) | Auth reference |
| Release/signal **delivery** to fw-server vs in-process record | Compatibility known gap #2 (003 §7.9) | “Signals always reach the server” |
| Which targeting **predicates** fw-server actually evaluates | SDK forwards attributes; rule engine is platform-side (004) | Targeting “how rules work” beyond client contract |
| CORS / any-origin on control-point routes | Specified for browsers (ADR-0009); not proven live | Web production |

### Registry / legal / pins

| Item | Why | Blocks |
|------|-----|--------|
| Live npm dist-tags after 2026-08-17 | Checked 2026-08-17: Node/Web `latest` = 2.1.0; can still move | Re-check tags before you ship install copy |
| `groupId ai.fireweave` on Maven Central | POM working assumption (003 §7.3) | Java coordinates as “official Central” |
| License ratification | README (003 §7.4) | Redistribution language |
| Go module tags vs quickstart `v0.0.0` + replace | 003 §7.15 | `go get` wording |
| Java OF pin 1.15.1 vs old brief 1.21.0 | 1.21.0 does not exist (ADR-0003 errata) | Document **1.15.1** unless the POM changes |
| CI “latest” / “stable” / “canary” cells | Float (003 §7.17) | Support matrix — use manifest minimums |

### Product console / in-app

| Item | Why | Blocks |
|------|-----|--------|
| In-app docs auth wall | Routes under `/(app)/docs`; no logged-in session (002) | Whether console copy is what customers see |
| Wrap vs promote as the intended workflow | In-app vs marketing glossary (002, 004) | Any agent/wrap guide |
| Rollout states, soak, verifier, seal, participants | In-app only; seal never defined (002) | Console operator docs |
| Log / Alert / Block and auto-rollback | Conflicts with guardrails stub (002, 003) | Watching-rollouts page (omitted in 005) |
| Agent surfaces (`/fw-rollout` vs marketplace `safe-rollout`) | 002 | Agent guides |
| `user-fireweave-staging` MCP | `needsAuth` (002) | Product API confirmation |
| Alerts vs Audit Logs vs rollout detail | 002 §5 | Console deep links |

### Docs platform

| Item | Why | Blocks |
|------|-----|--------|
| Mintlify GitHub App connected? | Not visible from repo files (032) | Deploy-on-push |
| Mintlify plan (assistant, dashboard CI) | 032 | Enabling those features |
| `navigation.pages`+nested groups vs `navigation.groups` | Both appear valid (032) | 006 nav rewrite |
| Custom domain / Cloudflare proxy state | `docs.fireweave.ai` NXDOMAIN (002, 032) | Canonical URL, SEO |
| Whether to ignore `audits/` / `TASKS.md` / this file in `.mintignore` | Recommended in 001/005/032; not applied | Publishing internal files |

### Unmerged SDK work

| Item | Why | Blocks |
|------|-----|--------|
| Local branch `java/sdk-parity-aug2026` (registerTarget, control points, local provider) | Ahead of `master` (003 §0, §7.8, §7.19) | Do not document until merged |

### Discovered while writing production / OpenFeature / testing pages (2026-08-17)

| Gap | Evidence | Docs implication |
|-----|----------|------------------|
| `FireweaveRemoteAdapter` **evaluate and capture are not retried** (Node, Python, Go, Java). Only `registerTarget` / `register_target` / Web `identify` retry **once** when the kind is retryable | Node/Python/Web remote adapters: retry loop only on register. Go/Java remote: no `retry` symbol | Do not document evaluate/capture retries. Taxonomy `retryable: yes` means a *later identical call* may succeed, not that the adapter retries |
| Go `runtime.Shutdown` does **not** drain `client.Exposures()` | `runtime.go` `Shutdown` → `adapter.Close` only. Remote `Close` flushes **adapter-pending** capture events. Extension queue is `Exposures().Flush` | Pair with Java: flush the client queue first. Do not say Go native shutdown flushes exposures |
| Web `sendBeacon` **cannot set `Authorization`**. Unload prefers `keepalive` fetch | `sdks/web/packages/sdk/src/adapters/remote.ts` comments + `sendBeaconOrKeepalive` | Document keepalive as the path that can send Bearer. Whether fw-server accepts an unauthenticated beacon is **NEEDS VERIFICATION** — do not instruct relying on beacon |
| SDK `docs/testing.md` still lists `POST /v1/targets/register` on the stub | Confirmed absent in `test-server/implementation/server.mjs` (already in CONFIRMED GAP above) | Official `testing.mdx` corrects this; do not copy the SDK testing doc |

---

## Implications for writers (until refined)

1. Quickstart and SDK pages must **lead with the registry** where published (Node/Web/Python as of 2026-08-17) and keep checkout for Go/Java and unreleased trees. Still caveat Node **2.0.0** vs **2.1.0**.
2. Targeting step is **three languages**, not five.
3. Exposures are **opt-in**. Java shutdown is **not** a flush.
4. Guardrails, OF tracking, wrap/`fw.isOn`, and console ramp/Block are **out of v1 pages** (see 005 omitted list).
5. When a page would need a NEEDS VERIFICATION item, write **BLOCKED** in the draft or omit the sentence — do not approximate.

---

## Refinement (2026-08-17, after pages + checkpoint 9)

- IA INCLUDE pages exist; “missing official-site coverage” moved to done.
- Live registry re-check: Node/Web/Python published; Go/Java unpublished.
- `master` still has no Go/Java `registerTarget`.
- Example validation: `scripts/validate-examples.mjs` + `audits/example-validation.md`.
- Do not add speculative product features to keep this list “complete.”
- Re-check npm/PyPI/Maven/Go tags before the next ship; they can move.
