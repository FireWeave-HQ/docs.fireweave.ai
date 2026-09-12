# Existing documentation audit

**Task:** 002  
**Date:** 2026-08-17  
**Primary target:** https://app.fireweave.ai/docs  
**This repo:** `/Users/niketh/Coding/docs.fireweave.ai` (Mintlify starter; no Fireweave product pages yet)

This audit inventories what already exists so the new Mintlify site can **rewrite**, not copy. Claims below are taken from recovered page text, compiled app routes, or other public sources. **Do not treat this file as an API spec.** Anything that could not be checked against SDK source is marked **UNVERIFIED**.

---

## Access method and confidence

| Attempt | Result |
|---------|--------|
| WebFetch `https://app.fireweave.ai/docs` | **BLOCKED** — fetch timed out |
| `curl` HTML of `/docs` | **200** — SvelteKit SPA boot shell only (no article text) |
| `https://app.fireweave.ai/docs/__data.json` (and each child) | **200** — `{"type":"data","nodes":[null,null,null,null]}` (no SSR payload) |
| `https://app.fireweave.ai/robots.txt` | **200** — `Disallow: /` for all user-agents; comments say the product app is not a public marketing corpus |
| `https://app.fireweave.ai/sitemap.xml` and `/docs/sitemap.xml` | **404** |
| `https://app.fireweave.ai/llms.txt` and `/docs/llms.txt` | **404** |
| `/api/docs`, `/api/v1/docs`, `/api/documentation` | **404** |
| SvelteKit client router (`/_app/immutable/entry/app.*.js` `dictionary`) | **Recovered** — complete in-app route table, including all docs pages |
| Compiled page modules (`/_app/immutable/nodes/17–21.*.js` and docs layout node `3`) | **Recovered** — full in-app docs copy is baked into client JS (not auth-gated at the asset layer) |
| Browser MCP | **Unavailable** in this session |
| `user-fireweave-staging` MCP | **BLOCKED** — `needsAuth`; no product/docs tools used |
| `https://docs.fireweave.ai` | **BLOCKED** — DNS does not resolve |
| This docs repo README / `index.mdx` / `quickstart.mdx` | Mintlify starter placeholders only; no pointers to existing Fireweave docs |

**Verdict:** Five in-app docs pages exist. HTML crawlers see an empty SPA. Content in this audit comes from the compiled client bundles and the SvelteKit route dictionary, not from a logged-in browser session. In-app pages live under the `/(app)/docs` group, so the **UI is likely login-gated** even though the JS assets are public.

---

## 1. Inventory table

### In-app product docs (source of this audit)

Sidebar labels come from the docs layout (`nodes/3.*.js`): Overview, Getting Started, Wrapping a Feature, Watching a Rollout, Concepts.

| # | Title (on page) | URL | HTTP (HTML) | Content recovered | Audience |
|---|-----------------|-----|-------------|-------------------|----------|
| 1 | Welcome to Fireweave / Documentation | https://app.fireweave.ai/docs | 200 SPA shell | Yes (node 17) | New console users |
| 2 | Getting Started | https://app.fireweave.ai/docs/getting-started | 200 SPA shell | Yes (node 19) | Operators setting up a project |
| 3 | Wrapping a Feature | https://app.fireweave.ai/docs/wrapping-features | 200 SPA shell | Yes (node 21) | Developers using a coding agent |
| 4 | Watching a Rollout | https://app.fireweave.ai/docs/watching-rollouts | 200 SPA shell | Yes (node 20) | On-call / rollout operators |
| 5 | Concepts | https://app.fireweave.ai/docs/concepts | 200 SPA shell | Yes (node 18) | Anyone reading product terms |

Probed paths that are **not** docs pages (SvelteKit 404 HTML, ~14.9 KB): `/docs/introduction`, `/docs/quickstart`, `/docs/sdk`, `/docs/sdks`, `/docs/openfeature`, `/docs/cli`, `/docs/api`, `/docs/python`, `/docs/node`, `/docs/control-points`, `/docs/flags`, `/docs/troubleshooting`, `/docs/migration`, `/docs/reference`, `/docs/production`, `/docs/testing`, `/docs/guides`, `/docs/overview`.

Linked **product UI** routes (SPA 200, not documentation): `/alerts`, `/integrations`, `/cli/auth`.

### Related public sources (not in-app docs; do not copy blindly)

These are **not** additional `app.fireweave.ai/docs` pages. They are listed so later tasks know where better source material lives.

| Source | URL | Role vs in-app docs |
|--------|-----|---------------------|
| Marketing glossary | https://fireweave.ai/glossary | Different vocabulary (control point, promote-not-wrap) |
| Marketing how-it-works | https://fireweave.ai/how | CLI install story (`fw init`); `get.fireweave.dev` **DNS failed** when probed |
| Marketing site | https://fireweave.ai/ and sitemap siblings | Positioning, scenarios, changelog — not developer reference |
| SDK docs tree | https://github.com/FireWeave-HQ/fireweave-sdk/tree/master/docs | OpenFeature, control points, releases, signals, testing — **sibling TASK-003** |
| PyPI `fireweave` 0.1.0 | https://pypi.org/project/fireweave/ | Python package blurb + in-memory example |
| Agent plugins | https://github.com/FireWeave-HQ/plugins-marketplace | Skills: `initialise`, `safe-rollout`, `adopt`, `cleanup`, `feedback`, `migrate-harness` |
| This Mintlify repo | `index.mdx`, `quickstart.mdx` | Starter kit; **archive/replace**, not migrate |

**Do not confuse with** https://www.fireweave.io/ (unrelated network-policy product) or https://docs.airweave.ai / https://docs.fireworks.ai (different companies).

---

## 2. Per-page notes

### 2.1 Overview — `/docs`

| Field | Notes |
|-------|--------|
| **Purpose** | Hub: one-paragraph product pitch + cards to the other four pages + a “what you can do” list. |
| **Audience** | First-time console visitor. |
| **Concepts** | Managed flag, wrap via prompt, rollout agent, ramp 0%→100%, automatic rollback, guardrail, Pause / Resume / Roll back, Block alerts. |
| **APIs mentioned** | None by name. |
| **Examples** | None. |
| **Accuracy** | **UNVERIFIED** against SDK. Pitch (“you don’t need to write the gating logic”) conflicts with the wrapping page, which shows hand-written `if (await fw.isOn(...))`. |
| **Missing** | Install, SDK languages, auth, environments, what a control point is, OpenFeature, how wrap actually lands in code. |
| **Duplicates** | Restates getting-started + watching (ramp, alerts, rollback). |
| **Outdated / unclear** | Uses “feature flag” / “managed flag”; marketing + SDK ADR-0007 use **control point**. Link to `/alerts` has **empty anchor text** in the template; runtime label helper returns **“Audit Logs”**, not “Alerts”. |
| **Broken links** | Internal docs links look valid. `/alerts` exists as a route; label/text is broken or misleading (see §4). |

### 2.2 Getting Started — `/docs/getting-started`

| Field | Notes |
|-------|--------|
| **Purpose** | Console checklist: integrations → project → environments → CLI → agent skills → wrap/register/seal/ramp. |
| **Audience** | Org admin + first developer. |
| **Concepts** | Integrations (flag + metrics, e.g. PostHog; GitHub for deploys), project, environments (branch/tag rules, capabilities), CLI `fw`, CLI Authorization, agent skills (Cursor / Claude / etc.), wrap → register → seal → ramp, rollout detail controls (Pause / Resume / Ramp up / Roll back), roles (org admins, primary developer, participants). |
| **APIs mentioned** | CLI binary name `fw` only. No REST paths, no SDK methods. |
| **Examples** | None (no install command, no `fw` flags). |
| **Accuracy** | **UNVERIFIED.** Checklist is product-UI oriented. Marketing `fw init` / `curl … get.fireweave.dev/install` is **not** on this page; that install host **did not resolve** (2026-08-17). |
| **Missing** | How to install `fw`; which integrations are required vs optional; what “seal” means; env vars; SDK install; language-specific first evaluate. |
| **Duplicates** | Overlaps overview (wrap and ramp) and watching (alerts vs ramp controls). |
| **Outdated / unclear** | “Ack does not resume or roll back” is useful but easy to miss. “Bind capabilities per environment” is undefined. |
| **Broken links** | `/integrations` and `/cli/auth` exist as SPA routes. `/alerts` same empty-text issue. |

### 2.3 Wrapping a Feature — `/docs/wrapping-features`

| Field | Notes |
|-------|--------|
| **Purpose** | How to ask a coding agent to gate a change and what the wrap looks like. |
| **Audience** | Developer in an agent (page title/subtitle say **Claude Code** only). |
| **Concepts** | Dark-launch, A/B old vs new, cohort key, baseline commit, ramp strategy, surface mode, wrap style (function-gate, route-gate, React switch), telemetry tags, flag at 0%, register rollout. |
| **APIs mentioned** | Slash command `/fw-rollout`. Example call `fw.isOn('fetch-orders-v2', { userId })`. |
| **Examples** | One TypeScript `fetchOrders` before/after snippet using `fw.isOn`. |
| **Accuracy** | **UNVERIFIED — do not copy the example.** Public SDK docs show OpenFeature `getBooleanValue` / `controlPoints.evaluate`, not `fw.isOn`. Plugin marketplace skills are named `safe-rollout` / `initialise` / `adopt`; **`/fw-rollout` was not found** in the public plugin tree listing. Marketing glossary says the intended path is **“promote, not wrap”** (post-hoc wrapping is not the intended path) — this page is the opposite story. |
| **Missing** | Node/Python/Go/Java real APIs; OpenFeature; how `fw` is imported; error/default behavior; Cursor/Codex/Cline/OpenCode invocation (getting-started claims them). |
| **Duplicates** | Cohort-key explanation repeats Concepts. |
| **Outdated / unclear** | Claude-only framing; `fw.isOn`; wrap-after-the-fact vs promote-not-wrap; “controller picks it up immediately” vs getting-started “seal then start the ramp”. |
| **Broken links** | `/alerts` empty text; `/docs/watching-rollouts` OK. |

### 2.4 Watching a Rollout — `/docs/watching-rollouts`

| Field | Notes |
|-------|--------|
| **Purpose** | Rollout states, severity scale, how to ack Block alerts, when auto-rollback happens. |
| **Audience** | Operator watching a live ramp. |
| **Concepts** | States: Registered, Ramping, Verifying, Completed, Rolled back. Severities: Log, Alert, Block. Header bell badge. Acknowledge vs Resume / Roll back. Block-gate auto-rollback to 0%. |
| **APIs mentioned** | None. |
| **Examples** | Two tables (states; severities). No API/CLI examples. |
| **Accuracy** | **UNVERIFIED** against product + SDK. SDK `docs/concepts.md` states capability `guardrails` is always `false` and lists “real guardrail evaluation” as **planned / not implemented**. In-app copy treats guardrail auto-rollback as current behavior. **Do not resolve this conflict here** — TASK-003 / product audit must. |
| **Missing** | Where rollout **detail** lives (getting-started says project rollout page; this page tells people to open `/alerts` to watch every rollout). Signal vs metric vs adoption. How to re-run after rollback. |
| **Duplicates** | Severity definitions overlap Concepts. Ack vs ramp-control warning overlaps Getting Started. |
| **Outdated / unclear** | `/alerts` copy vs UI string “Audit Logs”. “Watch on Alerts” vs “watch on rollout detail”. |
| **Broken links** | `/alerts` empty text (multiple). |

### 2.5 Concepts — `/docs/concepts`

| Field | Notes |
|-------|--------|
| **Purpose** | Glossary of in-app terms. |
| **Audience** | Anyone in the console. |
| **Concepts (as used)** | Rollout, feature flag, cohort key, guardrail metric, ramp stage, soak window, verifier, severity (Log / Alert / Block). |
| **APIs mentioned** | None. |
| **Examples** | None. |
| **Accuracy** | Definitions are internally consistent with the other four pages. They **do not match** marketing glossary or SDK ADR-0007 (no “control point”, no “adoption signal”, no “rollout-ready”). Guardrail/auto-page claims **UNVERIFIED** vs SDK. |
| **Missing** | Control point, targeting key vs cohort key, exposure, signal, outcome, release, stamp, OpenFeature Decision/reason, seal, participant, capability, environment. |
| **Duplicates** | Severity block is a shorter version of Watching. |
| **Outdated / unclear** | “Feature flag” as the product noun. “Four or five stages” vs wrapping default `1% → 5% → 25% → 50% → 100%`. |
| **Broken links** | None on this page. |

---

## 3. Terminology used in existing docs

Recorded **as used**, not redefined. Three corpora disagree.

### In-app docs (`app.fireweave.ai/docs`)

| Term | How it is used |
|------|----------------|
| Feature flag / managed flag / flag | On/off switch in code; Fireweave “manages” percentage; controller adjusts it |
| Rollout | Managed old→new transition with flag, cohort, guardrails, controller; ends completed or rolled back |
| Rollout agent / controller | Entity that ramps, watches metrics, pauses, rolls back |
| Wrap | Agent edits code to gate a change; also a checklist step |
| Register / seal / ramp | Sequence on Getting Started; seal is never defined |
| Cohort key | Stable per-user identifier (user / org / account / session ID) |
| Guardrail metric | Metric that, if worse than baseline, stops the rollout |
| Ramp stage | Percentage step (e.g. 5%) |
| Soak window | Time spent at a stage before advancing |
| Verifier | Automated check between stages (cohort keying, telemetry tags, orphan flags) |
| Severity: Log / Alert / Block | Log = audit only; Alert = notice, ramp continues; Block = pause / email / optional auto-rollback to 0% |
| Baseline | Git commit metrics are compared against |
| Surface mode / wrap style | How the agent finds and gates code |
| Primary developer / participants | Who can seal and control vs confirm deploy readiness |
| `fw` | CLI name; also implied JS helper `fw.isOn` |

**Not used in in-app docs:** control point, targeting key, exposure, signal, outcome, OpenFeature, Decision, stamp, adoption signal, rollout-ready, promote.

### Marketing glossary (`fireweave.ai/glossary`) — do not mix in without TASK-004

AI release engineer; **control point**; rollout (unit of shipping); **rollout-ready**; cohort (traffic slice); guardrail (stability or adoption); **adoption signal**; coding agent; **“Promote, not wrap”**.

### SDK docs (related; TASK-003 owns verification)

**Control point** is the product noun; `flag` remains at OpenFeature / wire / schema boundaries (ADR-0007). Also: Decision, reason, targeting key, `FireweaveClient.controlPoints` / deprecated `flags`, releases, signals, exposures, capabilities. SDK concepts file says `guardrails: false` in phase one.

---

## 4. Broken links found

| Location | Link | Issue |
|----------|------|--------|
| Overview, Getting Started, Wrapping, Watching | `<a href="/alerts"> </a>` | Anchor text is a space; JS fills it from a helper that returns **“Audit Logs”**, while surrounding copy says “Alerts”. Confusing and fails if JS does not run. |
| Marketing how-it-works | `https://get.fireweave.dev/install` | **DNS does not resolve** (probed 2026-08-17). Not an in-app docs link, but the public install story is broken. |
| Future public docs host | `https://docs.fireweave.ai` | **DNS does not resolve**. |
| Marketing | `https://fireweave.ai/docs` | **404**. |
| In-app | `/docs/introduction`, `/docs/quickstart`, language/SDK paths | **404** — expected; they are not in the router. |

In-app docs↔docs links (`/docs`, `/docs/getting-started`, `/docs/wrapping-features`, `/docs/watching-rollouts`, `/docs/concepts`) match the router.

Product UI targets `/integrations` and `/cli/auth` exist as SPA routes (200). Whether they work without login was **not** verified in a browser.

---

## 5. Duplicate / outdated content

### Duplicates (merge in the new site)

- Severity (Log / Alert / Block) — Concepts **and** Watching.
- Cohort key — Concepts **and** Wrapping.
- “Ack ≠ resume/rollback” — Getting Started **and** Watching.
- “Wrap then ramp” pitch — Overview **and** Getting Started **and** Wrapping.

### Internal contradictions (rewrite; do not copy both)

| Topic | In-app A | In-app B | Other corpus |
|-------|----------|----------|--------------|
| Who writes the gate | Overview: you don’t write gating logic | Wrapping: you get an `if (fw.isOn)` in your repo | SDK: OpenFeature / `controlPoints.evaluate` |
| When ramp starts | Wrapping: controller picks up immediately | Getting Started: wrap → register → **seal** → ramp | — |
| Where to watch | Watching: open `/alerts` | Getting Started: project **rollout detail** page | Changelog: Alerts link to rollout detail |
| Product noun | Feature flag | — | Marketing + SDK: **control point** |
| Intended workflow | Whole in-app set is “wrap an existing change” | — | Glossary: **promote, not wrap** |
| Agent surface | Wrapping: Claude Code + `/fw-rollout` | Getting Started: Cursor / Claude / etc. | Marketplace: Cursor, Claude, Codex, Cline, OpenCode; skills `safe-rollout`, `initialise`, … |
| Guardrails | Documented as live auto-rollback | — | SDK concepts: guardrails capability `false`; real evaluation “planned” |
| Alerts UI name | Copy says Alerts | Runtime string “Audit Logs” | Changelog still says “Rollout Alerts” |

### Likely outdated (NEEDS VERIFICATION before any reuse)

- `fw.isOn(...)` example — not present in public SDK quickstart/concepts.
- `/fw-rollout` slash command — not seen in public plugin tree.
- Post-hoc wrap as the primary path — contradicted by marketing glossary.
- “Feature flag” as the heading noun — contradicted by ADR-0007 (2026-08-08).
- Implicit “packages/docs are the product” — SDK quickstart still says packages may be checkout-only; PyPI already lists `fireweave` 0.1.0. **Do not guess publish status in new pages.**

---

## 6. Migration map

Recommended new paths follow a developer journey. Targets exist only where this audit (or a clearly related public source) has material. **No** new page is proposed solely because a suggested IA folder name exists.

| Existing page | New page | Action |
|---------------|----------|--------|
| https://app.fireweave.ai/docs | `introduction/` (replace starter `index.mdx`) | **Rewrite.** Keep the job-to-be-done (safe ramps). Drop “you don’t write gating logic.” Align noun with TASK-004 (likely control point). Do not copy the four-card hub verbatim. |
| https://app.fireweave.ai/docs/getting-started | `quickstart/` (console + CLI path) | **Rewrite and split.** Console checklist can inform a “set up the workspace” guide. Install steps must be re-verified (`fw` install host currently broken). Do not paste the six-item list as-is. |
| https://app.fireweave.ai/docs/wrapping-features | `guides/agent-rollouts` (or `guides/wrapping-features` only if product still supports post-hoc wrap) | **Rewrite after product decision.** If glossary “promote, not wrap” is current, **archive** wrap-as-primary and write an agent “rollout-ready change” guide from plugins + SDK. Do **not** copy `fw.isOn` or `/fw-rollout` until TASK-003 / plugin audit confirms them. |
| https://app.fireweave.ai/docs/watching-rollouts | `guides/watching-rollouts` + slice into `production/` | **Rewrite.** Keep the states table and Ack-vs-ramp-control distinction if product audit confirms them. Fix Alerts vs Audit Logs vs rollout-detail. Do not copy guardrail auto-rollback until SDK/product agree. |
| https://app.fireweave.ai/docs/concepts | `concepts/` | **Rewrite / merge** with marketing glossary + SDK ADR-0007 in TASK-004. Do not ship two glossaries. In-app definitions are a **source of current console language**, not the canonical noun list. |
| *(none in-app)* | `sdks/{node,python,go,java}` | **New, from SDK audit only.** In-app docs have no language pages. |
| *(none in-app)* | `openfeature/` | **New, from SDK audit only** if TASK-003 confirms the provider. |
| *(none in-app)* | `testing/`, `reference/`, `troubleshooting/`, `migration/` | **New, from SDK `docs/testing.md`, `troubleshooting.md`, `migration.md` — not from in-app.** In-app has no such pages. |
| Mintlify starter `index.mdx` / `quickstart.mdx` | same paths after IA | **Replace** placeholders. Not a product-docs migrate. |
| https://fireweave.ai/glossary | `concepts/` (input only) | **Do not copy** marketing sentences. Use as terminology input for TASK-004. |
| https://fireweave.ai/how | — | **Archive for docs.** Marketing. Install snippet is currently a broken host. |
| https://www.fireweave.io/ | — | **Ignore.** Different product. |

### Suggested IA (only folders justified by sources above)

```
introduction/          ← rewrite from Overview
quickstart/            ← rewrite from Getting Started + verified CLI/SDK install
guides/watching-rollouts
guides/agent-rollouts  ← rewrite from Wrapping *or* plugins, after wrap-vs-promote decision
concepts/              ← merge in-app + glossary + SDK; TASK-004 owns names
sdks/                  ← SDK audit, not in-app
openfeature/           ← SDK audit, if confirmed
production/            ← operator controls from Watching + Getting Started, if confirmed
testing/ reference/ troubleshooting/ migration/  ← SDK docs tree, not in-app
```

Do **not** create `guides/` or `production/` pages that invent targeting, exposures, or outcomes from marketing copy. Those wait for TASK-003 / TASK-004.

---

## 7. What NOT to copy

- Marketing fluff: “AI release engineer,” “no YAML,” “learning engine,” “regressions caught at 1% instead of 60%,” “your numbers are the product,” demo CTAs.
- “Nothing to integrate / hand-wire” — in-app getting-started requires integrations, CLI auth, and skills.
- “You don’t need to write the gating logic” — contradicted by the wrap example.
- `fw.isOn` and `/fw-rollout` until verified in SDK / plugins.
- Claude-only instructions as if they were the only agent.
- Guardrail auto-rollback and “paged the moment a guardrail breaks” until product + SDK agree (SDK currently documents guardrails as not implemented).
- Empty `/alerts` links and the Alerts vs Audit Logs mix-up.
- `get.fireweave.dev/install` until the host exists.
- fireweave.io / Airweave / Fireworks pages.
- Mintlify starter “Welcome to your project” / `npm install your-package`.
- Changelog feature announcements as if they were API reference (org `/v1` management API is mentioned on the marketing changelog only — **do not document endpoints from that sentence**).

---

## 8. Access blockers

| Blocker | Detail | Impact |
|---------|--------|--------|
| SPA / no SSR | Docs HTML is a loader; `__data.json` is empty | Crawlers and WebFetch cannot inventory by fetching HTML |
| `robots.txt` `Disallow: /` | Product app excluded from search/AI crawlers | Public discoverability of in-app docs is intentionally off |
| No sitemap / llms.txt / docs API | None found | Route table had to come from the client JS dictionary |
| Likely auth wall in UI | Routes under `/(app)/docs` | Unauthenticated humans may not see the same nav; **NEEDS VERIFICATION** in a logged-in session |
| `user-fireweave-staging` MCP | `needsAuth` | Could not use product APIs to confirm behavior |
| Browser MCP | Not available this session | Could not screenshot rendered pages |
| `docs.fireweave.ai` | DNS NXDOMAIN | New site not live |
| `get.fireweave.dev` | DNS NXDOMAIN | Public CLI install story broken |
| SDK `isOn` search via GitHub code API | 401 | Could not grep SDK from API; used published SDK markdown instead |

---

## Highest-value rewrites (for later tasks)

1. **`concepts/`** — resolve flag vs control point vs cohort key vs targeting key before any other page ships.  
2. **`quickstart/`** — replace the console checklist with a verified zero-to-evaluate path (SDK + CLI), not a copy of Getting Started.  
3. **`guides/agent-rollouts`** — replace Wrapping after wrap-vs-promote and `fw.isOn` are decided.  
4. **`guides/watching-rollouts`** — keep operator value (states, Ack vs ramp) once UI names and guardrails are verified.

---

## Return summary (for parent agent)

- **Pages inventoried:** **5** in-app docs pages (complete router set). Plus related marketing/SDK/plugin sources, not counted as in-app pages.
- **Access:** **Partial.** No SSR/auth-session render; **full copy recovered** from public JS bundles. MCP and `docs.fireweave.ai` blocked.
- **Already documented (in-app):** wrap/ramp story, console setup checklist, rollout states, Log/Alert/Block, cohort key, soak/verifier (console language).
- **Missing from in-app (exists elsewhere or not at all):** SDK languages, OpenFeature, control-point noun, targeting/exposures/signals/outcomes, install that works, testing, troubleshooting, migration, reference.
- **Audit file:** `/Users/niketh/Coding/docs.fireweave.ai/audits/existing-docs.md`
- **Rewrite first:** concepts (vocabulary), quickstart (verified install), agent-rollout guide (do not copy `fw.isOn`).
