# TASK-005 — Information architecture

**Date:** 2026-08-17  
**Depends on:** 001, 002, 003, 004, 032  
**Does not apply config.** Do not edit `docs.json` in this task.

**Publish-state correction (2026-08-17 live check, after the first audit snapshot):** npm `@fireweaveai/sdk` `latest` = **2.1.0** (2.0.0 remains published and still has `./posthog`). `@fireweaveai/web-sdk@2.1.0` is on npm. PyPI `fireweave==0.1.0`; `pip install 'fireweave[openfeature]'` is valid. Go and Java remain unpublished (replace + checkout / `mvn install`). Sitemap rows and §7–§8 below that still say “Python/Web unpublished” or “npm latest is 2.0.0” are the **first-draft** IA and are stale — do not copy them into user-facing pages.

This IA is built from **verified SDK functionality** (`audits/sdk-audit.md`) and the vocabulary in `audits/terminology.md`. In-app pages are migration inputs, not a sitemap to copy. Suggested folders from the project brief were **adjusted**: pages exist only when a verified capability needs them.

---

## 1. Design principles

1. **Developer journey first:** Install → Configure → Initialize → Register target *(language-gated)* → Evaluate → Record outcome → Shutdown.
2. **No fictional pages.** If the API is absent, unpublished, or contradicted, omit or label — do not stub a how-to that cannot be true.
3. **One glossary.** Terms come from `audits/terminology.md`. In-app “feature flag” / `fw.isOn` do not get their own pages.
4. **Language differences:** separate **SDK pages** where the public surface diverges (five packages). Shared concepts use **callouts**, not five copies.
5. **Preserve the starter contract:** keep root `index.mdx` and `quickstart.mdx` paths; replace copy later. Never add `mint.json`.
6. **Beginner → advanced** in the sidebar (Mintlify `navigation.groups`). Tabs are optional later; not required for v1.

---

## 2. Full sitemap

Page IDs are Mintlify paths (no `.mdx`). Every INCLUDE row is tied to a verified capability.

### 2.1 Pages to create (INCLUDE)

| Path | Title | Audience | Why it exists (verified capability) | Source evidence |
|------|-------|----------|-------------------------------------|-----------------|
| `index` | FireWeave | New developers | Homepage: what the SDK does, five languages, path into quickstart. Replaces starter Introduction | SDK README opening; 003 §1; starter path must stay (001) |
| `introduction/how-it-works` | How it works | New developers | Evaluate + extensions flow without claiming console ramp/wrap | Architecture layers + remote protocol; 003 §3 |
| `introduction/architecture` | Architecture | Developers integrating | Provider + Client → Runtime → Adapter; wire paths that exist | `/tmp/fireweave-sdk/docs/architecture.md`; `spec/remote-protocol.md` |
| `quickstart` | Quickstart | First-hour developers | Zero-to-evaluate using **real** APIs; publish caveats | SDK `docs/quickstart.md`; 003 install tables; starter path (001) |
| `sdks/node` | Node.js, Bun, and Deno | JS server developers | `@fireweaveai/sdk` surface, 2.0.0 vs 2.1.0, runtimes | 003 §2.1; `docs/runtimes.md` |
| `sdks/python` | Python | Python developers | `fireweave` extras, snake_case, unpublished | 003 §2.2 |
| `sdks/go` | Go | Go developers | `Flags()` only, no registerTarget, context.Context | 003 §2.3 |
| `sdks/java` | Java | Java developers | No `controlPoints`, no registerTarget, no env auto-read, close ≠ flush | 003 §2.4 |
| `sdks/web` | Browser | Frontend developers | `@fireweaveai/web-sdk`: sync reads, `identify`, STALE, no env, unpublished, public-key warning | 003 §2.5; ADR-0009 |
| `sdks/compatibility` | Compatibility | All SDK users | Type split, adapter matrix, conformance skips | 003 §1 tables; `docs/compatibility.md` |
| `concepts` | Core concepts | All | Glossary landing; points at term pages; ADR-0007 duality | 004; ADR-0007 |
| `concepts/control-points` | Control points | Developers evaluating | Native evaluate APIs + `flagKey` duality + type table | 003 §2–3; ADR-0007 |
| `concepts/targeting` | Targeting and targets | Developers identifying users | `targetingKey`, properties, register vs identify, Go/Java gap | 003 targets; `docs/identity.md`; `docs/remote.md` |
| `concepts/releases` | Releases | Developers attesting rollouts | `setContext` / `start` / `complete` / `fail` + ID rules | 003 releases; `docs/extensions.md` |
| `concepts/exposures` | Exposures | Developers measuring assignment | `record` / `flush` / `sendExposure` default **false** | 003 exposures; ruling 20 |
| `concepts/signals` | Signals and outcomes | Developers reporting results | Four kinds; `recordOutcome`; allowlist | 003 signals; `spec/signal.schema.json` |
| `concepts/capabilities` | Capabilities | Tooling / defensive integrators | `capabilities.get`; guardrails stub called out as **non-feature** | 003 capabilities; `docs/concepts.md` |
| `concepts/adapters` | Adapters | Developers choosing a backend | Remote, InMemory, Local (lang-gated), PostHog extra (lang-gated) | 003 adapters; ADR-0005/0006 |
| `openfeature` | OpenFeature | Teams standardizing on OF | Providers in all five; resolver table; no tracking | 003 §4; ADR-0003; `docs/openfeature.md` |
| `production/configuration` | Configuration and auth | Anyone leaving InMemory | `FW_API_URL`, `FW_PROJECT_API_KEY`, Bearer, allowlists, Java/Web exceptions | 003 config tables |
| `production/lifecycle` | Initialize, ready, shutdown | Production services | Lifecycle states; flush-on-shutdown **except Java `close`** | 003 lifecycle; `docs/lifecycle.md` |
| `production/errors` | Errors | Anyone debugging defaults | 15-kind taxonomy + OF code map | 003 errors; `contracts/errors.md` |
| `testing` | Testing | Developers writing tests | InMemoryAdapter + test-server routes that **exist** | 003 §5; `docs/testing.md` (correct the register-route error) |
| `troubleshooting` | Troubleshooting | Developers stuck on defaults | Real signatures from SDK troubleshooting | `docs/troubleshooting.md`; 003 error kinds |
| `migration/node-2` | Migrate Node 2.0 to 2.1 | Existing npm 2.0.0 users | Quoted CHANGELOG breakages only | 003 §6; SDK `CHANGELOG.md`; `docs/migration.md` |
| `reference/packages` | Package and API index | All | Package names, peers, what is published | 003 §1 |

### 2.2 Pages OMITTED (do not create in the first wave)

| Suggested / tempting path | Why omitted |
|---------------------------|-------------|
| `introduction/what-is-fireweave` | Duplicates `index`. Homepage owns the pitch |
| `introduction/core-concepts` | Duplicates `concepts` |
| `quickstart/node` (etc. as separate routes) | One `quickstart` with language **Tabs** matches the journey; depth lives under `sdks/*` |
| `guides/` (entire group) | No verified agent/console how-to that is safe to publish. Wrap, `/fw-rollout`, `fw.isOn` are unverified or absent |
| `guides/wrapping-features` | In-app wrap story + `fw.isOn`. SDK does not implement wrap. Marketing says promote-not-wrap. **BLOCKED** on product decision |
| `guides/agent-rollouts` | Plugin skills exist in another repo; this audit did not verify `/fw-rollout`. Defer |
| `guides/watching-rollouts` | Console states + Log/Alert/Block + guardrail auto-rollback. Conflicts with SDK `guardrails: false`. Defer to a product audit |
| `production/guardrails` | Stub only (`UnsupportedCapability` everywhere) |
| `production/watching` / console operator runbook | Not SDK-proven |
| `openfeature/tracking` | OF spec §6 not implemented |
| `concepts/outcomes` as a standalone page | Outcome is a **signal kind** + release complete. Lives on `concepts/signals` (TASK-019 writes that section) |
| `concepts/wrap` / `concepts/ramp` / `concepts/cohort` | Not SDK types. Cohort key = `targetingKey` (explained on targeting page) |
| `sdks/mobile`, `sdks/ios`, `sdks/android`, `sdks/rust`, `sdks/dotnet` | No packages under `sdks/` |
| `cli/` / `fw` install | In-app mentions `fw`; `get.fireweave.dev` DNS failed (002). No SDK CLI in fireweave-sdk |
| `reference/openapi` / REST playground | No customer OpenAPI artifact in this repo. Do not invent endpoints beyond the three wire paths, and those belong as a short appendix on architecture — not a fake playground |
| `reference/fw-isOn` | API does not exist |
| Published-registry install pages that pretend PyPI / Maven / Go proxy / `@fireweaveai/web-sdk` work | Unpublished (003). Checkout commands only, with warnings |
| In-process Node local evaluation | Removed in tree 2.1.0 |
| Java/Go `registerTarget` how-to | Absent on `master` |

---

## 3. Navigation grouping (for later `docs.json`)

**Do not apply this now.** Official Mintlify pattern for a single-product SDK is `navigation.groups` (032). Starter currently uses `navigation.pages` + nested group — both appear valid; 006 should confirm before rewriting.

Proposed sidebar, beginner → advanced:

```text
Get started
  index
  introduction/how-it-works
  introduction/architecture
  quickstart

SDKs
  sdks/node
  sdks/python
  sdks/go
  sdks/java
  sdks/web
  sdks/compatibility

Concepts
  concepts
  concepts/control-points
  concepts/targeting
  concepts/releases
  concepts/exposures
  concepts/signals
  concepts/capabilities
  concepts/adapters

OpenFeature
  openfeature

Production
  production/configuration
  production/lifecycle
  production/errors

Testing
  testing

Troubleshooting
  troubleshooting

Migration
  migration/node-2

Reference
  reference/packages
```

**Global anchors (replace Mintlify marketing links in task 006):** GitHub SDK repo, app console **only if** a stable logged-in URL is confirmed. Do not keep Mintlify docs/blog anchors.

**Navbar primary:** FireWeave app or GitHub — **NEEDS VERIFICATION** of the customer-facing URL (`docs.fireweave.ai` DNS did not resolve; `app.fireweave.ai` is the in-app host).

Optional later: Mintlify **tabs** (Guides | SDKs | Reference) if the site grows. Not required for this sitemap.

---

## 4. Migration map (5 in-app pages → new pages)

In-app source: `https://app.fireweave.ai/docs` (002). New site **rewrites**; it does not copy.

| Existing in-app page | New page(s) | Action |
|----------------------|-------------|--------|
| `/docs` Overview | `index` | **Rewrite.** Keep job-to-be-done (safe releases). Drop “you don’t write gating logic.” Use **control point**. No four-card hub copy |
| `/docs/getting-started` | `quickstart` + `production/configuration` | **Rewrite and split.** Console checklist is **not** the official quickstart. Install must be SDK checkout / npm-2.0 caveat. CLI `fw` **omitted** until install is verified |
| `/docs/wrapping-features` | — | **Archive** for official docs. Do not migrate `fw.isOn` or `/fw-rollout`. Revisit only after wrap-vs-promote + plugin audit |
| `/docs/watching-rollouts` | — (possible future console guide) | **Archive** for v1. States / Ack / Block **not** SDK-confirmed. Guardrail auto-rollback contradicts SDK stub |
| `/docs/concepts` | `concepts` + children | **Rewrite / merge** with ADR-0007 + 004. In-app definitions are console language, not the canonical noun list |
| Mintlify starter `index.mdx` / `quickstart.mdx` | same paths | **Replace** placeholder copy (tasks 007, 008) |
| `https://fireweave.ai/glossary` | input to `concepts` only | **Do not copy** marketing sentences |
| `https://fireweave.ai/how` | — | **Ignore** for docs (broken install host) |

---

## 5. Redirect candidates

**None are configured.** `docs.json` has no `redirects` key today (001, 032). Candidates if slugs change later:

| Source | Destination | Notes |
|--------|-------------|-------|
| `/quickstart` | stay | Keep this path; starter and 001 already use it |
| `/introduction` | `/` or `/introduction/how-it-works` | Only if someone links a folder URL |
| `/sdks` | `/sdks/node` or `/sdks/compatibility` | Folder landing optional; not in sitemap |
| `/concepts/outcomes` | `/concepts/signals` | If anyone bookmarks a split we rejected |
| `/guides/wrapping-features` | — | Do **not** add a redirect that implies the guide exists |
| `app.fireweave.ai/docs/*` | `docs.fireweave.ai/…` | **Product-app / DNS concern**, not this repo. In-app is a different host and is likely login-gated (002) |
| `https://docs.fireweave.ai` | — | DNS NXDOMAIN as of 002/032. Custom domain is dashboard + DNS (032), not a Git redirect |

When 006/027 add redirects, use Mintlify `docs.json` `redirects` (308 default) and validate with `mint broken-links --check-redirects`.

---

## 6. SDK differences: callout vs separate page

### Separate pages (surface is a different product entry)

| Difference | Page |
|------------|------|
| Five packages, five install stories | `sdks/node`, `sdks/python`, `sdks/go`, `sdks/java`, `sdks/web` |
| Browser sync / STALE / `identify` / no env / public key | `sdks/web` (do not fold into Node) |
| Node 2.0.0 (`./posthog`) → tree 2.1.0 | `migration/node-2` |
| Full matrix | `sdks/compatibility` |

### Callouts on shared pages (do not fork the concept)

| Topic | Where the callout lives | Fact (from 003) |
|-------|-------------------------|-----------------|
| `registerTarget` / `identify` | `concepts/targeting`, `quickstart` | Node, Python, Web only. Go/Java **absent** |
| Evaluation type names | `concepts/control-points`, `openfeature` | Node/Web: `number`. Python/Go: int + float. Java native helpers: boolean + string only; other types via `evaluate` or OF |
| `controlPoints` namespace | `concepts/control-points` | Node/Python/Web yes. Go `Flags()`. Java no facade |
| `sendExposure` default | `concepts/exposures`, `openfeature` | **false** in all languages |
| Shutdown vs flush | `production/lifecycle` | Node/Python/Web shutdown flushes. Java `close()` does **not** |
| Env-var config | `production/configuration` | Node/Python/Go remote yes. Java no getenv. Web no env |
| Local / PostHog adapters | `concepts/adapters` | Local: Node/Python/Web. PostHog: Python/Go (Java seam) |
| OpenFeature pins | `openfeature` | Document actual pins (Java **1.15.1**, not 1.21.0) |
| Test-server register | `testing` | Stub does **not** implement `/v1/targets/register` |

---

## 7. Homepage content outline (`index`)

Replace starter “Welcome to your project.” No invented APIs. No `fw.isOn`.

1. **Title / one paragraph** — FireWeave SDKs evaluate **control points**, optionally register **targets**, drive a **release** lifecycle, and record **exposures** and **signals**. Auth is a FireWeave project key to **fw-server**.
2. **Status callout** — Pre-release. `@fireweaveai/sdk` npm `latest` is **2.0.0**; tree docs describe **2.1.0**. Python, Go, Java, and `@fireweaveai/web-sdk` are **unpublished** — install from checkout (link quickstart).
3. **What you can do (verified only)** — Evaluate boolean/string/numeric/object decisions; OpenFeature providers; releases; exposures (opt-in); signals (health/error/metric/outcome); capabilities discovery.
4. **What this site will not pretend** — Working client guardrails; OpenFeature tracking; Go/Java target registration; wrap/`fw.isOn`.
5. **Cards** — Quickstart; Node; Python; Go; Java; Browser; Concepts; OpenFeature.
6. **Next step** — Link `quickstart`.

Do **not** use marketing claims (“regressions caught at 1%”, “you don’t write gating logic”, “AI release engineer” as a capability). SDK README tagline may be mentioned as positioning only if needed — not as an API.

---

## 8. Quickstart journey (real APIs)

Single page `quickstart` with Mintlify `Tabs` / `CodeGroup` per language. Offline first (`InMemoryAdapter`), then a **Production** subsection with `FireweaveRemoteAdapter` and env caveats.

| Step | What to show | Language gates / warnings |
|------|----------------|---------------------------|
| 1. Install | Checkout build paths from SDK `docs/quickstart.md`. Node may mention `npm install @fireweaveai/sdk` **only** with “resolves to 2.0.0 today; 2.1 APIs need checkout or a future pin” | Do **not** write `pip install fireweave`, `go get` latest, Maven Central, or `npm install @fireweaveai/web-sdk` as if they work |
| 2. Configure | Construct adapter + runtime. InMemory: `{ flags: { 'new-checkout': { type, enabled, value, variant } } }`. Remote: `FW_API_URL` + `FW_PROJECT_API_KEY` where those env vars are actually read | Java: pass `FireweaveConfig` — no getenv. Web: ctor `apiUrl` / `apiKey` required; no env; do not bake `attest:write` keys (scoped `fw_public_…` is **platform NEEDS VERIFICATION**) |
| 3. Initialize | `runtime` / `client.initialize` or `OpenFeature.setProviderAndWait`. Mention Node `lazyReady` default **true** | Wait for READY before treating values as live |
| 4. Register target | Node `runtime.registerTarget`; Python `register_target`; Web `client.identify` | **Omit the step for Go and Java** (no API). Note InMemory + test-server do not persist registration |
| 5. Evaluate control point | Native or OF `getBooleanValue` / language equivalent with `{ targetingKey }` | Use `flagKey` in code. Never `fw.isOn`. Java: boolean/string helpers or `evaluate`. Go: `Flags().Evaluate`. Web: **sync** |
| 6. Record outcome | `signals.recordOutcome` / `record_outcome` / `RecordOutcome` | Optional in the first run; show it so the journey is complete |
| 7. Shutdown | `client.shutdown()` / `OpenFeature.close()` / `runtime.Shutdown` | **Java:** `exposures().flush()` then `close()` — close does not flush |

Example keys in snippets should match SDK docs (`new-checkout`, `user_42`) — already used in README/quickstart, not invented here.

---

## 9. Explicit non-pages / non-claims

Writers must not create pages or sections that treat the following as shipped, universal, or copy-safe:

- Unpublished registry installs without a warning
- `fw.isOn`, `/fw-rollout`, CLI `fw` install from `get.fireweave.dev`
- OpenFeature Tracking §6
- Guardrails as a working evaluator
- Go/Java `registerTarget` / `controlPoints`
- Java implicit flush on `close`
- `sendExposure` default-on
- Test-server `POST /v1/targets/register`
- Node `./posthog` on the 2.1 line
- `fw_public_…` as if already issued
- Java auto-read of `FW_*`
- Mobile / extra language SDKs
- In-app wrap/ramp/Log/Alert/Block as SDK concepts
- Marketing install host, `docs.fireweave.ai` as live, or org `/v1` management API from changelog prose

---

## 10. Proposed TASK IDs (Web SDK + IA file mapping)

`TASKS.md` today has 009–012 for Node/Python/Go/Java and **no** Web task. Web is a verified fifth package (003 §2.5, ADR-0009).

| ID | Proposal |
|----|----------|
| **033** | **Browser / Web SDK documentation** — `sdks/web.mdx`. Depends on 003, 005, 006. Same checkpoint family as 009–012 (core language pages) |

Existing task file mapping (for the tracker update):

| ID | Files (from this IA) |
|----|----------------------|
| 007 | `index.mdx` |
| 008 | `quickstart.mdx` |
| 009 | `sdks/node.mdx` |
| 010 | `sdks/python.mdx` |
| 011 | `sdks/go.mdx` |
| 012 | `sdks/java.mdx` |
| 033 | `sdks/web.mdx` |
| 013 | `concepts.mdx` |
| 014 | `concepts/targeting.mdx` |
| 015 | `concepts/control-points.mdx` |
| 016 | `concepts/releases.mdx` |
| 017 | `concepts/exposures.mdx` |
| 018 | `concepts/signals.mdx` (kinds) |
| 019 | `concepts/signals.mdx` (outcomes section — no extra page) |
| 020 | `openfeature.mdx` |
| 021 | `testing.mdx` |
| 022 | `production/configuration.mdx`, `production/lifecycle.mdx`, `production/errors.mdx` |
| 023 | `troubleshooting.mdx` |
| 024 | `migration/node-2.mdx` |
| 025 | `reference/packages.mdx`, `sdks/compatibility.mdx` |
| 007 note | `introduction/how-it-works.mdx` and `introduction/architecture.mdx` ship with homepage/intro work (007) or immediately after — do not invent a new ID unless 007 is split |

---

## 11. Mintlify notes that affect IA (from 032)

- Page files: prefer `.mdx`.
- Ignore internal files in `.mintignore` when 006 runs: `audits/`, `TASKS.md`, `DOCUMENTATION_GAPS.md` (001 already flagged this).
- Components to plan for (not apply now): `Steps`, `Tabs`/`CodeGroup`, `Warning` (publish + language gaps), `Card`+`Columns` on homepage.
- Do not add OpenAPI navigation until a real spec file exists in **this** repo.

---

## 12. Recommended next workstream split

**Workstream A — Mintlify foundation (006, 027 partial, ignore rules)**  
Rebrand `docs.json` (name, colors, nav groups above, drop Mintlify anchors). Add `.mintignore` entries for audits/tracker/gaps. Logos. Do **not** write product claims in config.

**Workstream B — Content (007–025, 033)**  
Write pages from 003 + 004 only. Start with `index`, `quickstart`, five SDK pages + web, then concepts, then OF / production / testing.

Do not start B’s examples until A’s nav paths exist, or keep writing files on disk and wire nav in 006/027 in the same change set.

---

## Validation

- Every INCLUDE page maps to a capability in `audits/sdk-audit.md` §9 or a starter path that 001 said to keep.
- No page exists solely because the brief listed a folder.
- No `fw.isOn`, no published-PyPI-as-fact, no Go/Java registerTarget how-to, no guardrails product page.
- Terminology matches `audits/terminology.md`.
