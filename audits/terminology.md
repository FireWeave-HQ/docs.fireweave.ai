# TASK-004 — Canonical terminology

**Date:** 2026-08-17  
**Depends on:** `audits/existing-docs.md` (002), `audits/sdk-audit.md` (003)  
**SDK commit cited:** `dfeb478` (`master` of [FireWeave-HQ/fireweave-sdk](https://github.com/FireWeave-HQ/fireweave-sdk))  
**Clone checked:** `/tmp/fireweave-sdk`

This file is the vocabulary contract for official docs. It does **not** invent product nouns. Definitions are taken from implementation, then tests/specs, then SDK docs/ADRs, then in-app copy. In-app and marketing terms that the SDK does not implement are recorded as **collisions** or **console-only**, not as canonical SDK API.

**Do not redefine FireWeave terminology in user-facing pages without updating this file and citing evidence.**

---

## How to use this file

| Confidence | Meaning |
|------------|---------|
| **HIGH** | Implemented in SDK `master` (and usually also in spec/contracts) |
| **MEDIUM** | SDK docs / accepted ADR; matches implementation where checked |
| **LOW** | In-app or marketing only; **not** an SDK API |
| **NEEDS VERIFICATION** | Sources disagree, or behavior is platform-side and not proven from the SDK repo |
| **ABSENT** | Searched; not present as an API on `master` |

Source priority (same as TASK-003): implementation → tests → spec/contracts → examples → SDK `docs/` → existing FireWeave docs → assumptions (never for API claims).

---

## Product spelling

| Form | Where it appears | Use in official docs |
|------|------------------|----------------------|
| **FireWeave** | GitHub org `FireWeave-HQ`, this repo, user-facing site name | **Preferred product name** on docs.fireweave.ai |
| **Fireweave** | SDK README, ADRs, Java/Go package prose, `FireweaveClient` / `FireweaveRuntime` type names | Keep in **code identifiers**. In prose, prefer FireWeave except when quoting SDK docs |
| **Fireweave-HQ** | Go module path `github.com/FireWeave-HQ/fireweave-sdk/sdks/go` | Code/module only |
| **fw-server** | SDK remote protocol, adapters | The evaluation/capture backend the SDKs call. Do not rename |
| **fw** | In-app CLI name; implied JS helper in wrap example | CLI: **NEEDS VERIFICATION** (install host did not resolve). JS helper `fw.isOn`: **ABSENT** from SDK `master` |

---

## Collision index (read this first)

These are the collisions that will produce wrong docs if writers mix corpora.

| Collision | Canonical for official docs | Do not do |
|-----------|----------------------------|-----------|
| **Control point vs flag** | Product noun is **control point** ([ADR-0007](/tmp/fireweave-sdk/docs/adr/0007-control-point-vocabulary.md)). Wire, OpenFeature, Decision/Exposure schemas keep `flagKey` | Do not invent `controlPointKey`. Do not tell readers OpenFeature uses “control point” as a parameter name |
| **In-app “feature flag” vs SDK “control point”** | SDK + marketing glossary: control point. In-app five pages: feature flag / managed flag | Rewrite in-app language; do not ship two glossaries |
| **`client.flags` vs `client.controlPoints`** | Node/Python: same object; `flags` is a deprecated alias. Go: `Flags()` only. Java: no `controlPoints` namespace. Web: `controlPoints` (sync) | Do not document `controlPoints` on Go/Java. Do not say `flags` is removed in 2.x |
| **`targetingKey` vs in-app “cohort key”** | SDK: OpenFeature `targetingKey` **is** the cohort key ([`docs/identity.md`](/tmp/fireweave-sdk/docs/identity.md)). In-app: “cohort key” only | Explain the alias once; use `targetingKey` in all code samples |
| **`identify` vs `registerTarget`** | Same job, different names: Node `runtime.registerTarget`, Python `runtime.register_target`, Web `client.identify()` → `registerTarget`. **Go/Java: no API on `master`** | Do not document Go/Java registration. Do not treat Web `identify` as OpenFeature identify |
| **Exposure vs OpenFeature tracking** | FireWeave exposures are `exposures.record` / `flush` and opt-in `sendExposure` (default **false**). OpenFeature Tracking (spec §6) is **not implemented** | Do not document `provider.track` / OF tracking |
| **Signal `outcome` vs release complete** | `signals.recordOutcome` is a telemetry kind. `releases.complete` / `fail` are release lifecycle transitions (complete also records an outcome signal on Node per SDK extensions doc) | Do not collapse them into one invented “outcome API” |
| **Capability `guardrails` vs in-app guardrail auto-rollback** | SDK: typed stub, always `UnsupportedCapability`, `guardrails: false`. In-app: live auto-rollback / Block | Do not document working client-side guardrails |
| **Wrap / ramp (console) vs SDK evaluate / releases** | Wrap and ramp are **in-app operator/agent workflow** terms. SDK has evaluate + `releases.*`. No `wrap` / `ramp` methods | Do not present wrap/ramp as SDK APIs |
| **`fw.isOn` vs real evaluate APIs** | **ABSENT** from SDK `master` (repo-wide search). In-app wrap page shows `fw.isOn` | Never copy that example |
| **Log / Alert / Block** | In-app severity scale only. Not SDK signal kinds | Do not map them onto `recordHealth` / `recordError` without product proof |
| **Architecture.md sketch vs shipped API** | [`docs/architecture.md`](/tmp/fireweave-sdk/docs/architecture.md) §6 still shows illustrative `phc_` keys, `exposurePolicy.defaultSend: true`, `adapter("posthog")` | Prefer `sdk-audit.md` + implementation. That sketch is **stale** in places |

---

## Term catalog

Each term uses the requested columns. Citations are paths in the SDK clone or in this docs repo’s audits.

### FireWeave

| Field | Content |
|-------|---------|
| **Term** | FireWeave (prose) / Fireweave (SDK types) |
| **Definition** | Server-side (plus a browser package) release-safety SDK: evaluate control points, optionally register targets, drive a release lifecycle, and report exposures / health / error / metric / outcome signals. Applications authenticate with a FireWeave project key and talk to **fw-server**. Evidence: SDK README opening paragraph; ADR-0005. |
| **Where it appears** | This repo; GitHub `FireWeave-HQ`; SDK README; in-app “Fireweave”; marketing `fireweave.ai` |
| **SDK API** | Packages: `@fireweaveai/sdk`, `fireweave`, `github.com/FireWeave-HQ/fireweave-sdk/sdks/go`, `ai.fireweave:*`, `@fireweaveai/web-sdk`. Types: `FireweaveClient`, `FireweaveRuntime`, `FireweaveProvider`, web equivalents |
| **User-facing explanation** | FireWeave is the SDK and service you use to evaluate control points and report what happened during a release. It is not a generic “feature-flag console” noun in official docs |
| **Related** | control point, fw-server, OpenFeature, adapter |
| **Confidence** | HIGH for SDK role. Product-console behavior **NEEDS VERIFICATION** (in-app copy recovered from JS; not SDK-proven) |

### Control point

| Field | Content |
|-------|---------|
| **Term** | control point |
| **Definition** | The product noun for a point of control over a release. Evaluation still uses the parameter name `flagKey` at OpenFeature, wire, and schema boundaries. ADR-0007: “the thing an operator reasons about is a **point of control over a release**, not a boolean.” Rename is **additive** — `flag` is not removed. |
| **Where it appears** | ADR-0007; SDK README; Node/Python/Web `controlPoints` / `control_points`; capabilities `static.features.controlPoints` (Node). **Not** a Go/Java namespace. **Not** used in the five in-app docs pages |
| **SDK API** | Node: `client.controlPoints.evaluate` / `getBooleanValue` / `getStringValue` / `getNumberValue` / `getObjectValue`. Python: `client.control_points.get_*` / `evaluate`. Web: same as Node but **synchronous**. Go: `client.Flags().Evaluate` only. Java: `client.evaluate` / `getBooleanValue` / `getStringValue` |
| **User-facing explanation** | A control point is the named decision your code asks FireWeave for (on/off, string, number, object). In code samples the key is still called `flagKey` |
| **Related** | flag, Decision, OpenFeature, targeting |
| **Confidence** | HIGH (ADR-0007 accepted 2026-08-08; Node/Python/Web namespaces implemented) |

### Flag (vs control point)

| Field | Content |
|-------|---------|
| **Term** | flag / `flagKey` |
| **Definition** | The **boundary term** fixed by OpenFeature, the fw-server wire protocol (`POST /v1/flags/evaluate`, `flagKeys`), and canonical envelopes (`Decision.flagKey`, `Exposure.flagKey`, `Signal.flagKey`). Also `capabilities.static.features.flags` (pinned `true` in contracts). In-app docs use “feature flag” / “managed flag” as the product noun — that usage is **not** canonical for this site. |
| **Where it appears** | OpenFeature getters; spec schemas; remote protocol; InMemoryAdapter fixture field `flags`; in-app Concepts page |
| **SDK API** | Parameter name `flagKey` everywhere. Node/Python alias `client.flags` === `client.controlPoints` (deprecated JSDoc; `FW_DEPRECATION_WARNINGS=1` for a one-shot notice). Go `Flags()`. Java has no flags/controlPoints facade |
| **User-facing explanation** | When you call OpenFeature or look at the HTTP body, the field is `flagKey`. When you talk about the product, say control point |
| **Related** | control point, OpenFeature, InMemoryAdapter |
| **Confidence** | HIGH |

### Target

| Field | Content |
|-------|---------|
| **Term** | target |
| **Definition** | A user or device identity, keyed by `targetingKey`, that can carry **durable** properties stored by fw-server via `POST /v1/targets/register`. Spec: registration is idempotent; re-register updates properties. `fw_`-prefixed property keys are reserved and stripped. |
| **Where it appears** | `spec/remote-protocol.md`; Node `registerTarget`; Python `register_target`; Web `identify`; **absent** in Go/Java on `master`. Spec line 26 still says “Node SDK only today” — **stale** vs Python+Web implementation |
| **SDK API** | Node: `FireweaveRuntime.registerTarget(targetingKey, options?)` → `{ ok, error? }`, **never throws**. Python: `register_target`. Web: `FireweaveWebClient.identify` then `setContext({ targetingKey })`. Options: `kind?: 'user' \| 'device'`, `properties?`, `environment?`, `signal?` (Node). Go/Java: **no symbol** |
| **User-facing explanation** | A target is “who this decision is for.” Register durable facts once (where the API exists); send the same `targetingKey` on every evaluate |
| **Related** | targeting, targeting properties, identify, targetingKey |
| **Confidence** | HIGH for Node/Python/Web. ABSENT for Go/Java. Spec prose stale (NEEDS VERIFICATION to update spec, not docs invention) |

### Targeting

| Field | Content |
|-------|---------|
| **Term** | targeting |
| **Definition** | Selecting a Decision using `targetingKey` plus attributes / registered properties / groups. SDK never auto-generates an identity (ADR-0001 §8). Missing key on backend evaluation → default + `TARGETING_KEY_MISSING` (`InvalidContext`). `requireTargetingKey` defaults **false** in the four server SDKs (opt-in strictness). Percentage assignment hashes `(flag, targetingKey)` — key must be stable. |
| **Where it appears** | `docs/identity.md`; evaluation context schema; remote evaluate body (`targetingKey`, `attributes`, `groups`, `groupProperties`) |
| **SDK API** | Context field `targetingKey`. Canonical group keys `fireweave.groups` / `fireweave.groupProperties` (plain `groups` / `groupProperties` alias). Other `fireweave.*` keys → `InvalidContext` |
| **User-facing explanation** | Targeting is how FireWeave decides which value a control point returns for a given identity. You own the ID; the SDK will not invent one |
| **Related** | target, targeting properties, cohort, targetingKey |
| **Confidence** | HIGH for client rules. Which **server-side** targeting predicates fw-server supports is **NEEDS VERIFICATION** (not fully specified as a product rule engine in the SDK repo) |

### Targeting properties

| Field | Content |
|-------|---------|
| **Term** | targeting properties / person properties |
| **Definition** | Durable or per-request attributes used for condition matching. Two paths compose ([`docs/remote.md`](/tmp/fireweave-sdk/docs/remote.md#two-identity-paths), `spec/remote-protocol.md`): (1) `registerTarget` properties stored server-side; (2) per-evaluate `attributes` (win for that call). `$`-prefixed attributes are backend system directives, not person properties. |
| **Where it appears** | Identity + remote docs; `RegisterTargetOptions.properties`; evaluate `attributes` |
| **SDK API** | `registerTarget(..., { properties })` (Node/Python/Web). Evaluation context attributes. Not a separate “setProperties” API |
| **User-facing explanation** | Put long-lived facts (plan, region) on the target when you can register; put request-only facts on the evaluate call |
| **Related** | target, targeting, registerTarget |
| **Confidence** | HIGH for the two-path contract. Whether fw-server actually persists properties in production **NEEDS VERIFICATION** (platform) |

### Targeting key / cohort key

| Field | Content |
|-------|---------|
| **Term** | `targetingKey` (SDK) / cohort key (in-app + SDK identity prose) |
| **Definition** | SDK quote: “The OpenFeature `targetingKey` **is** the cohort key.” Forwarded verbatim; never rewritten. Also the join to exposures. In-app Concepts: “stable per-user identifier (user / org / account / session ID).” Same idea, different name. |
| **Where it appears** | OpenFeature context; wire; in-app Wrapping + Concepts |
| **SDK API** | `targetingKey` on evaluate/context/identify/register. Not `cohortKey` as an SDK parameter |
| **User-facing explanation** | Use one stable ID per person or org. Call it `targetingKey` in code. “Cohort key” is the console/agent synonym |
| **Related** | targeting, cohort, exposure |
| **Confidence** | HIGH that they are the same ID. LOW that in-app “cohort key” UI matches this 1:1 (not verified in a logged-in session) |

### Cohort

| Field | Content |
|-------|---------|
| **Term** | cohort |
| **Definition** | **Not** a first-class SDK type. Used in three ways: (1) SDK identity prose — the population sharing one `targetingKey` (e.g. whole org); (2) InMemoryAdapter **test fixture** example attribute `cohort: 'beta'` in `docs/testing.md` — that is a **user attribute name in an example**, not an API; (3) In-app / marketing — traffic slice for a ramp. |
| **Where it appears** | `docs/identity.md`; `docs/testing.md` examples; in-app Concepts; marketing glossary |
| **SDK API** | None named `cohort`. Do not document `cohort` as a method or reserved key |
| **User-facing explanation** | A cohort is the set of targets that share an assignment key. In code you still pass `targetingKey` |
| **Related** | targetingKey, ramp (console) |
| **Confidence** | MEDIUM for the identity meaning. Example attribute name must not be promoted to API |

### Release

| Field | Content |
|-------|---------|
| **Term** | release |
| **Definition** | FireWeave **extension**: bind the process to a rollout identity, then report lifecycle transitions. `ReleaseContext` requires `rolloutId` (1–128 chars) and `stampIds` (`stmp_` + 26 Crockford chars, 1–64 unique). Optional `changeId` (`chg_` + 26). Deploy-attestation (“boot beacon”) semantics are `setContext` + `start`. |
| **Where it appears** | `docs/extensions.md`; `spec/release-context.schema.json`; all five language clients |
| **SDK API** | `releases.setContext` / `start` / `complete` / `fail` (snake_case in Python; `Releases()` in Go; `releases()` in Java). Go returns `error`; others return result objects |
| **User-facing explanation** | A release is the SDK’s record of “this process is serving this rollout.” It is not the in-app rollout state machine (Registered / Ramping / …) |
| **Related** | outcome, signal, stamp, rollout (console) |
| **Confidence** | HIGH for client API. Backend delivery of release events is **NEEDS VERIFICATION** (compatibility known gap: Go/Java sink vs Node/Python in-process) |
| **Do not confuse with** | In-app **rollout** (Registered, Ramping, Verifying, Completed, Rolled back) — console workflow, UNVERIFIED against this API |

### Exposure

| Field | Content |
|-------|---------|
| **Term** | exposure |
| **Definition** | A recorded “this target saw this control-point value.” Queued in-process, deduplicated on `(targetingKey, flagKey, variant, value)` (SDK extensions; web tests use `(flagKey, targetingKey, variant)`). Drained by `flush`. Evaluate-path emission is **opt-in**: `sendExposure` / `send_exposure` / `SendExposure` default **false**. Phase-one OpenFeature evaluate is side-effect-free. Wire: `POST /v1/capture` with `type: "exposure"`. fw-server may map that to a vendor `$feature_flag_called` — SDKs never emit that name on the public wire. |
| **Where it appears** | All five SDKs; `spec/remote-protocol.md`; ADR-0003 |
| **SDK API** | `exposures.record` / `flush`. Evaluate options `sendExposure`. Web also flushes on `visibilitychange` / `pagehide` (`keepalive` / `sendBeacon`). Node/Python/Web `shutdown` flushes first. **Java `close()` does not implicit-flush** |
| **User-facing explanation** | An exposure is proof a target was shown a decision. It is off unless you turn it on or call `record` |
| **Related** | control point, targetingKey, OpenFeature tracking (absent) |
| **Confidence** | HIGH |

### Signal

| Field | Content |
|-------|---------|
| **Term** | signal |
| **Definition** | Release-safety telemetry envelope. Spec kinds: `health` \| `error` \| `metric` \| `outcome` (`spec/signal.schema.json`). Messages secret-redacted; attributes pass an allowlist (Node default list includes `name`, `kind`, `status`, `value`, `unit`, `rolloutId`, `changeId`, `stampId`, `errorKind`, `message`, `flagKey`, `variant`, `environment`, `service`). |
| **Where it appears** | All five SDKs; extensions docs; capture wire (`type: "signal"`) |
| **SDK API** | `signals.recordHealth` / `recordError` / `recordMetric` / `recordOutcome` (snake_case in Python). Generic `record` on some languages |
| **User-facing explanation** | Signals are how your app tells FireWeave how the release is going — health, errors, metrics, outcomes. They are not the in-app Log/Alert/Block scale |
| **Related** | outcome, health/error/metric, capability, guardrails (stub) |
| **Confidence** | HIGH for kinds + APIs. Delivery to fw-server **NEEDS VERIFICATION** per adapter (same skew as releases) |

### Health / error / metric signals

| Field | Content |
|-------|---------|
| **Term** | health signal, error signal, metric signal |
| **Definition** | Three of the four spec kinds. Health: component status (examples in spec: `ok`, `degraded`). Error: `errorKind` + redacted `message`. Metric: named observation `value` (number \| boolean \| string) + optional `unit`. These are **SDK telemetry**, not console alert severities. |
| **Where it appears** | `spec/signal.schema.json`; `docs/extensions.md` examples |
| **SDK API** | `recordHealth` / `recordError` / `recordMetric` |
| **User-facing explanation** | Use health for “is this component ok,” error for failures you already classified, metric for numeric observations. Do not invent extra kinds |
| **Related** | signal, outcome, ErrorKind |
| **Confidence** | HIGH |

### Outcome

| Field | Content |
|-------|---------|
| **Term** | outcome |
| **Definition** | (1) Signal kind `outcome` via `recordOutcome` (name + status, optional rollout correlation). (2) Release transition `complete` / `fail` — extensions doc: Node `releases.complete()` “records an outcome signal too.” Not a separate product object in the SDK. |
| **Where it appears** | Signal spec; extensions; README quickstart `signals.recordOutcome` |
| **SDK API** | `signals.recordOutcome` / `record_outcome` / `RecordOutcome`. Not `fw.outcome(...)` |
| **User-facing explanation** | Record an outcome when a user-visible or release-level result happened (e.g. checkout completed). Completing a release is a different call |
| **Related** | signal, release |
| **Confidence** | HIGH for the API. Whether the console “Completed / Rolled back” states consume these signals **NEEDS VERIFICATION** |

### Capability

| Field | Content |
|-------|---------|
| **Term** | capability |
| **Definition** | Discoverable matrix of what this build + adapter can do (`spec/capabilities.schema.json`): **static** (compile-time features: `controlPoints`, `flags`, `releases`, `exposures`, `signals`, `guardrails: false`, adapters, …) and **runtime** (`remoteEvaluation`, `localEvaluation`, `exposureEmission`, `sideEffectFreeReads`, …). Phase one: `guardrails` always `false`. |
| **Where it appears** | All five SDKs; `docs/concepts.md` capability matrix; contracts |
| **SDK API** | `capabilities.get()`; Node also `list()`; Python `names()` / `invoke`; Go `Operations()` / `Invoke`; Java `capabilities().get()`. `invokeCapability(name)` degrades with `UnsupportedCapability` |
| **User-facing explanation** | Ask the SDK what it can do instead of sniffing versions. If `guardrails` is false, do not call guardrails as if they work |
| **Related** | adapter, guardrails, control point |
| **Confidence** | HIGH |
| **Do not confuse with** | In-app “bind capabilities per environment” (Getting Started) — **undefined** in recovered copy; **NEEDS VERIFICATION** |

### Runtime

| Field | Content |
|-------|---------|
| **Term** | runtime / `FireweaveRuntime` |
| **Definition** | Shared owner of lifecycle, config, adapter, and exposure policy. Architecture: `FireweaveProvider` + `FireweaveClient` → `FireweaveRuntime` → `BackendAdapter`. Lifecycle states: `UNINITIALIZED` \| `INITIALIZING` \| `READY` \| `STALE` \| `ERROR` \| `FATAL` \| `SHUTDOWN`. Web adds a load-bearing **STALE** when prefetch loses a 5s ceiling — must not be collapsed into READY (web runtime comments). |
| **Where it appears** | All five packages; `docs/architecture.md`; `docs/lifecycle.md` |
| **SDK API** | `FireweaveRuntime` / `FireweaveWebRuntime` / Go `Runtime`. `initialize` / `shutdown`. Default shutdown timeout 10_000 ms |
| **User-facing explanation** | The runtime is the engine behind both OpenFeature and the FireWeave client. Create one, share it, shut it down once |
| **Related** | adapter, client, OpenFeature, lifecycle |
| **Confidence** | HIGH |

### Adapter

| Field | Content |
|-------|---------|
| **Term** | adapter / BackendAdapter |
| **Definition** | Vendor-neutral evaluate/capture/lifecycle backend. Production default: **FireweaveRemoteAdapter** (fw-server). Tests: **InMemoryAdapter**. Dev/local boolean map: **FireweaveLocalAdapter** (Node/Python/Web only). Direct PostHog: Python extra + Go package; **removed from Node 2.1**; Java seam-only (`UnsupportedCapability` from `create(config)`). |
| **Where it appears** | Architecture; `docs/remote.md`; per-language adapters |
| **SDK API** | See InMemoryAdapter, FireweaveRemoteAdapter below. Web: `FireweaveRemoteWebAdapter`, `InMemoryWebAdapter`, `FireweaveLocalWebAdapter` |
| **User-facing explanation** | The adapter is how the runtime talks to a backend. Production uses FireWeave’s remote adapter, not a vendor SDK in your process (Node 2.1 / intended path) |
| **Related** | FireweaveRemoteAdapter, InMemoryAdapter, runtime |
| **Confidence** | HIGH |

### InMemoryAdapter

| Field | Content |
|-------|---------|
| **Term** | InMemoryAdapter |
| **Definition** | Deterministic fixture adapter for tests and offline quickstarts. Fixture fields used in tests/docs: `type`, `enabled`, `value`, `variant`, optional `matchAttribute` / `MatchAttributes`, payload, metadata. Java lives in `ai.fireweave.testing`. Web: `InMemoryWebAdapter`. Does **not** implement `registerTarget` — reports `UnsupportedCapability`. |
| **Where it appears** | All five languages; `docs/testing.md`; `docs/quickstart.md` |
| **SDK API** | Node `new InMemoryAdapter({ flags, fault?, initError?, initGate? })`. Python/Go/Java/Web equivalents |
| **User-facing explanation** | Use this in unit tests and the first quickstart so nothing needs a network |
| **Related** | adapter, testing, flag fixture |
| **Confidence** | HIGH |

### FireweaveRemoteAdapter

| Field | Content |
|-------|---------|
| **Term** | FireweaveRemoteAdapter |
| **Definition** | Production HTTP adapter to fw-server. Paths implemented in adapters: `POST /v1/flags/evaluate`, `POST /v1/capture`; Node/Python/Web also `POST /v1/targets/register`. Auth: `Authorization: Bearer <key>`. Env (Node/Python/Go remote): `FW_API_URL`, `FW_PROJECT_API_KEY`. Java: constructor/`FireweaveConfig` only — **no `System.getenv`**. Web: required ctor fields; **no env**. Host allowlists differ (Node/Web: Fireweave hosts + loopback; Python/Go/Java defaults include PostHog hosts + loopback). `https` off-loopback; `http` loopback only. |
| **Where it appears** | `docs/remote.md`; per-language `adapters/remote` |
| **SDK API** | `FireweaveRemoteAdapter` / Go `adapters/remote` / `FireweaveRemoteWebAdapter` |
| **User-facing explanation** | This is the production connection: your project key and the FireWeave server URL |
| **Related** | adapter, fw-server, registerTarget |
| **Confidence** | HIGH for client behavior. Whether `app-server.fireweave.ai` is the customer-facing host **NEEDS VERIFICATION** |

### FireweaveRuntime

| Field | Content |
|-------|---------|
| **Term** | FireweaveRuntime |
| **Definition** | See **Runtime**. Listed separately because docs and TASKS call it out as a named type. |
| **Where it appears** | Node/Python/Java/Web public exports; Go `fireweave.Runtime` |
| **SDK API** | Constructor takes an adapter (+ config). `initialize`, `shutdown`, `registerTarget` (Node/Python/Web runtime) |
| **User-facing explanation** | Construct `FireweaveRuntime` with an adapter, then pass it to `FireweaveClient` and/or `FireweaveProvider` |
| **Related** | runtime, adapter, client |
| **Confidence** | HIGH |

### OpenFeature

| Field | Content |
|-------|---------|
| **Term** | OpenFeature |
| **Definition** | Standard evaluation API. FireWeave ships a provider in **all five** packages. Compliance floor: OF spec **v0.8.0** (ADR-0003). OF = flags; `FireweaveClient` = extensions (releases, exposures, signals, targets, capabilities). Tracking (OF spec §6): **planned, not implemented**. FireWeave ships no product hooks except Go’s reserved-key guard hook. |
| **Where it appears** | All five SDKs; `docs/openfeature.md`; ADR-0003 |
| **SDK API** | Node `FireweaveProvider` + `@openfeature/server-sdk` ^1.22.0. Python `fireweave.openfeature.FireweaveProvider` + `openfeature-sdk` ≥0.10,<0.11. Go `openfeature.NewProvider` + go-sdk v1.17.2. Java `ai.fireweave.openfeature.FireweaveProvider` + `dev.openfeature:sdk` **1.15.1**. Web `FireweaveWebProvider` + `@openfeature/web-sdk` ^1.9.0; **sync** resolvers; metadata name `fireweave-web`; `runsOn = 'client'` |
| **User-facing explanation** | You can evaluate control points through the OpenFeature client so your call sites stay portable. Release/exposure/signal APIs stay on the FireWeave client |
| **Related** | flag, control point, FireweaveProvider, tracking (absent) |
| **Confidence** | HIGH |

### identify vs registerTarget

| Field | Content |
|-------|---------|
| **Term** | `identify` vs `registerTarget` |
| **Definition** | Same registration job. **Web** exposes `FireweaveWebClient.identify(targetingKey, options?)` which calls `runtime.registerTarget` then `setContext({ targetingKey })` (`sdks/web/packages/sdk/src/client.ts` ~392–398). **Node/Python** expose `registerTarget` / `register_target` on the runtime (not a client `identify`). **Go/Java:** no registration API on `master`. This is **not** OpenFeature `identify` and **not** analytics `posthog.identify` as a documented FireWeave method. |
| **Where it appears** | Web client; Node/Python runtime; remote protocol |
| **SDK API** | See table in Target |
| **User-facing explanation** | Browser: call `identify`. Node/Python: call `registerTarget`. Go/Java: pass properties on each evaluate until an API exists |
| **Related** | target, targeting properties |
| **Confidence** | HIGH |

### Wrap

| Field | Content |
|-------|---------|
| **Term** | wrap |
| **Definition** | **In-app / agent workflow only.** Recovered copy: a coding agent edits application code to gate a change (function-gate, route-gate, React switch). Marketing glossary contradicts with “Promote, not wrap.” **No** `wrap` method in the five SDKs. |
| **Where it appears** | In-app Overview, Getting Started, Wrapping a Feature; marketing glossary (as the thing *not* to do) |
| **SDK API** | **ABSENT** |
| **User-facing explanation** | Do not document wrap as an SDK API. If a later product audit confirms an agent skill, that is a **guide**, not a concept equivalent to `evaluate` |
| **Related** | ramp, `fw.isOn` (absent), control point |
| **Confidence** | LOW (console language). Product decision wrap-vs-promote **NEEDS VERIFICATION** |

### Ramp

| Field | Content |
|-------|---------|
| **Term** | ramp |
| **Definition** | **In-app operator workflow.** Recovered copy: percentage steps (e.g. 1% → 5% → 25% → 50% → 100%), soak window, Pause / Resume / Ramp up / Roll back. SDK has no `ramp` API. Reason `SPLIT` may surface when the **backend** reports percentage-rollout bucketing (`docs/concepts.md`) — that is a Decision reason, not a ramp controller. |
| **Where it appears** | In-app Getting Started, Watching, Concepts; Decision reason `SPLIT` |
| **SDK API** | **ABSENT** as a method. `SPLIT` reason: MEDIUM (produced when backend reports it) |
| **User-facing explanation** | Ramping is a console/controller concern. The SDK evaluates and reports; it does not advance percentages |
| **Related** | wrap, release, guardrails (stub), Log/Alert/Block |
| **Confidence** | LOW for console ramp. MEDIUM for `SPLIT` reason string |

### Log / Alert / Block

| Field | Content |
|-------|---------|
| **Term** | Log, Alert, Block |
| **Definition** | **In-app severity scale only** (Watching + Concepts). Recovered: Log = audit only; Alert = notice, ramp continues; Block = pause / email / optional auto-rollback to 0%. Runtime UI string for `/alerts` may read **“Audit Logs”**. **Not** SDK signal kinds. |
| **Where it appears** | In-app docs only |
| **SDK API** | **ABSENT** |
| **User-facing explanation** | Do not document these as SDK terms until a product audit confirms the live console. Do not map Block → `recordError` |
| **Related** | ramp, guardrails |
| **Confidence** | LOW. Auto-rollback conflicts with SDK `guardrails: false` — **NEEDS VERIFICATION** |

### Decision / reason

| Field | Content |
|-------|---------|
| **Term** | Decision, reason |
| **Definition** | Canonical evaluation result (`spec/decision.schema.json`): `flagKey`, `value` (or caller default), optional `variant`, `reason`, error fields, `metadata`. Reasons documented in SDK concepts: `TARGETING_MATCH`, `SPLIT`, `DISABLED`, `STALE`, `ERROR`. Evaluation **never throws** — failures are error Decisions. |
| **Where it appears** | All languages; OF `ResolutionDetails` |
| **SDK API** | Native `evaluate` / `get_details`; OF `*Details` getters |
| **User-facing explanation** | Always inspect `reason` / `errorCode` when the value looks like your default — the default is also the failure path |
| **Related** | control point, OpenFeature, errors |
| **Confidence** | HIGH |

---

## Terms seen in product docs that are **not** canonical SDK APIs

Recorded so writers do not “promote” them.

| Term | Corpus | Official-docs status |
|------|--------|----------------------|
| `fw.isOn` | In-app Wrapping | **ABSENT** in SDK `master`. Do not document |
| `/fw-rollout` | In-app Wrapping | Not found in public plugin tree listing (002). **NEEDS VERIFICATION** |
| seal | In-app Getting Started | Never defined. **NEEDS VERIFICATION** |
| verifier / soak window / ramp stage | In-app Concepts | Console-only. **NEEDS VERIFICATION** before any page |
| rollout agent / controller | In-app | Console-only. **NEEDS VERIFICATION** |
| primary developer / participants | In-app | Console roles. **NEEDS VERIFICATION** |
| surface mode / wrap style | In-app Wrapping | Agent UX. **NEEDS VERIFICATION** |
| AI release engineer | Marketing + SDK README tagline | Positioning, not an API |
| promote, not wrap | Marketing glossary | Conflicts with in-app wrap story. **NEEDS VERIFICATION** |
| adoption signal | Marketing glossary | SDK has `recordMetric` / `recordOutcome`, not a type named adoption signal |
| rollout-ready | Marketing + internal harness research | Not a public SDK type |
| OpenFeature `track` | ADR-0003 experimental intent | **Not implemented** (003). Do not document |

---

## Reserved keys and ID prefixes (do not invent others)

From identity + release-context + remote protocol (HIGH unless noted):

| Token | Role |
|-------|------|
| `targetingKey` | Identity join |
| `kind` | Reserved in evaluation context; also register-target `user` \| `device` |
| `fireweave.groups` / `fireweave.groupProperties` | Only permitted `fireweave.*` context keys |
| `flagKey` | Envelope / wire / OF |
| `rolloutId`, `chg_…`, `stmp_…` | Release context (`sfc_` appears in architecture typed-ID list — **do not document as a required SDK field** unless a page cites the schema requiring it) |
| `project-api-key_…` | Current key prefix in spec |
| `fw_public_…` | Specified as **required platform work** before production browser keys — **NEEDS VERIFICATION** that fw-server issues them |
| `fw_`-prefixed **target properties** | Reserved, stripped server-side |
| `phc_` / `phs_` / `phx_` | Vendor keys — never send on the FireWeave remote path |

---

## Writer rules (normative)

1. User-facing prose: **control point**, **target**, **release**, **exposure**, **signal**, **outcome** (as signal kind), **capability**, **runtime**, **adapter**.
2. Code and HTTP: **`flagKey`**, **`targetingKey`**, `/v1/flags/evaluate`, `/v1/capture`, `/v1/targets/register`.
3. First time `flag` appears on a page, one sentence: *OpenFeature and the wire still say `flagKey`; the product name is control point (ADR-0007).*
4. Language-gate **registerTarget** / **identify**. Never imply Go/Java have it.
5. Never document `fw.isOn`, OF tracking, or working guardrails.
6. In-app wrap/ramp/Log/Alert/Block stay out of SDK pages until a product audit confirms them. They may appear in a future **console** guide, labeled as console terms.
7. If a term is not in this file and not in `sdk-audit.md`, mark **NEEDS VERIFICATION** — do not guess.

---

## Validation

- Cross-checked against `audits/sdk-audit.md` §§1–8 and the collision list in `audits/existing-docs.md` §3 and §5.
- Re-read ADR-0007, `docs/identity.md`, `docs/extensions.md`, `docs/remote.md`, `spec/remote-protocol.md`, `spec/signal.schema.json`.
- Confirmed Web `identify` → `registerTarget` in `/tmp/fireweave-sdk/sdks/web/packages/sdk/src/client.ts` (file contains NUL bytes; text search tools may miss it).
- Confirmed `fw.isOn` has **no** matches under `/tmp/fireweave-sdk`.
