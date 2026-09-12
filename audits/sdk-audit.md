# TASK-003 — Fireweave SDK source audit

**Audit date:** 2026-08-17  
**Source of truth:** [FireWeave-HQ/fireweave-sdk](https://github.com/FireWeave-HQ/fireweave-sdk)  
**Commit audited:** `dfeb478` (`master` — `feat(python): SDK parity — register_target, control_points, local provider (#4)`)  
**Clone used:** `/tmp/fireweave-sdk` (fresh shallow clone of `origin/master`)  
**Spec version:** `0.1.0` (`spec/version.json`)  
**OpenFeature spec floor:** `0.8.0`

This document is an implementation audit for official docs. It does **not** invent APIs. Every claim is cited to source. Unclear items are marked **NEEDS VERIFICATION** or **BLOCKED**.

---

## 0. How this audit was produced

- Official repo cloned to `/tmp/fireweave-sdk` at `master`.
- A local checkout also exists at `/Users/niketh/Coding/fireweave-sdk/Untitled` on branch `java/sdk-parity-aug2026` (`192a4f4`), **ahead of master** with unmerged Java parity work. **This audit is of `master` only.** The feature branch is noted under §7, not treated as released API.
- Existing Fireweave docs site (`docs.fireweave.ai`) is a Mintlify starter (`index.mdx`, `quickstart.mdx` placeholders). It is **not** a source of SDK truth.
- `TASKS.md` does not exist in the docs repo. This file is the TASK-003 deliverable; no `TASKS.md` was created (another agent owns that file).

**Source priority applied:** implementation → tests → spec/contracts → examples → SDK `docs/` → existing Fireweave docs.

---

## 1. Executive summary of verified SDKs

Five packages exist in `sdks/`. Four are server SDKs; one is a browser binding.

| Language / surface | Package | Version in tree | Published? | Runtime (from manifests + CI) |
| --- | --- | --- | --- | --- |
| Node / Bun / Deno | `@fireweaveai/sdk` | `2.1.0` (`sdks/node/packages/sdk/package.json`) | **Yes (live 2026-08-17).** npm has `0.1.0`, `2.0.0`, `2.1.0`; dist-tag `latest` = **2.1.0**. **2.0.0** is still published and still has the direct PostHog adapter / `./posthog`. npm 2.1.0 tarball `gitHead` is `fd19cad` (not audit clone `dfeb478`). | Node `>=20.20` (engines); CI Node 20 + 24, Bun 1.2.0 + latest, Deno `v2.x` + canary |
| Python | `fireweave` | `0.1.0` (`sdks/python/pyproject.toml`) | **Yes (live 2026-08-17).** PyPI `fireweave==0.1.0`. `pip install 'fireweave[openfeature]'` is valid. | Python `>=3.10`; CI 3.10 + 3.14 |
| Go | `github.com/FireWeave-HQ/fireweave-sdk/sdks/go` | `0.1.0` (compatibility matrix); `go.mod` is `go 1.25.12` | **Unpublished** as a tagged module | Go 1.25; CI `1.25.x` + `stable` |
| Java | `ai.fireweave:fireweave-{sdk,openfeature,adapter-posthog,testing}` | `0.1.0-SNAPSHOT` | **Unpublished.** Parent POM: “DO NOT PUBLISH.” `groupId ai.fireweave` is a working assumption. | Java 11+ (`maven.compiler.release`); CI JDK 11 + 25 |
| Browser | `@fireweaveai/web-sdk` | `2.1.0` (`sdks/web/packages/sdk/package.json`) | **Yes (live 2026-08-17).** npm `@fireweaveai/web-sdk@2.1.0` (`gitHead` dfeb478). | Browser. CI: Bun only + happy-dom. **Not** a Node/Deno target. |

**Shared product surface (verified in all four server SDKs + web):**

- Evaluate control points / flags (boolean + string + numeric + object — see per-language type split).
- Releases: `setContext` / `start` / `complete` / `fail`.
- Exposures: `record` / `flush` (deduped).
- Signals: health / error / metric / outcome.
- Capabilities: `get` (and invoke/list variants).
- Guardrails: **typed stub** — every call degrades with `UnsupportedCapability`.
- OpenFeature provider (server SDKs + web).
- `InMemoryAdapter` (or `InMemoryWebAdapter` / Java `fireweave-testing`).
- `FireweaveRemoteAdapter` speaking `POST /v1/flags/evaluate` and `POST /v1/capture`.

**Asymmetry on `master` (do not paper over in docs):**

| Capability | Node 2.1 | Python 0.1.0 | Go 0.1.0 | Java 0.1.0-SNAPSHOT | Web 2.1 |
| --- | --- | --- | --- | --- | --- |
| Product noun | `controlPoints` (`flags` alias) | `control_points` (`flags` alias) | `Flags()` only | `evaluate` / `getBooleanValue` / `getStringValue` — **no** `controlPoints` namespace | `controlPoints` (sync) |
| `registerTarget` | ✅ `runtime.registerTarget` | ✅ `runtime.register_target` | ❌ **absent** | ❌ **absent** | ✅ `client.identify()` → `registerTarget` |
| Direct PostHog adapter | ❌ removed | ✅ `fireweave[posthog]` | ✅ `adapters/posthog` | ⚠️ seam only — `PostHogAdapter.create(config)` → `UnsupportedCapability` | ❌ none |
| Local (dev) adapter | ✅ `FireweaveLocalAdapter` + `makeFireweaveLocalProvider()` | ✅ `FireweaveLocalAdapter` + `make_fireweave_local_provider()` | ❌ **absent** | ❌ **absent** | ✅ `FireweaveLocalWebAdapter` |
| In-process local evaluation (secret-key poll) | ❌ none | ✅ via PostHog extra | ✅ via PostHog adapter | ⏳ blocked on unpublished `com.posthog:posthog-server` | ❌ never (`localEvaluation` structurally false) |
| Env-var config | `FW_API_URL`, `FW_PROJECT_API_KEY`, `FW_DEPRECATION_WARNINGS` | same + PostHog keys in **examples only** | `FW_API_URL`, `FW_PROJECT_API_KEY` on remote adapter | **No `System.getenv` in Java sources.** Config is constructor/`FireweaveConfig` only. Javadoc *maps* `host`/`projectApiKey` to those env names. | **Reads no environment** |
| Default host allowlist | Fireweave hosts + loopback | PostHog hosts + loopback | PostHog hosts + loopback (PostHog adapter); remote adapter defaults to configured host + loopback | PostHog hosts + loopback | Fireweave hosts + loopback (same pattern as Node) |

**Conformance (from `docs/compatibility.md` + `contracts/README.md`):** 65 shared fixtures. Python 65/65, Go 65/65, Java 64/65, Node 63/65. Web: 10/10 in `contracts/web/`.

**Status quoted from root README:** “pre-release.” License MIT; “do not redistribute packages built from this repository until the license is ratified and publication is authorized.”

---

## 2. Per-language sections

### 2.1 Node — `@fireweaveai/sdk`

**Paths:** `sdks/node/packages/sdk/`  
**Peer:** `@openfeature/server-sdk` `^1.22.0` (needed only for the OpenFeature provider). **Zero runtime dependencies.**

#### Install (from README / quickstart — not invented)

Published path (**live 2026-08-17:** npm `latest` = **2.1.0**; pin `@2.1.0` — 2.0.0 is a different API):

```bash
npm install @fireweaveai/sdk@2.1.0 @openfeature/server-sdk   # or: bun add …
```

Deno (README): `import { … } from 'npm:@fireweaveai/sdk'` — “needs no install step.” Follows npm `latest` (**2.1.0** as of 2026-08-17).

From checkout (`docs/quickstart.md`) — contributing / unreleased tree:

```bash
(cd sdks/node && npm install && npm run build)
npm install ../fireweave-sdk/sdks/node/packages/sdk @openfeature/server-sdk
```

Root README also: “Not yet published — until then, install from a checkout.” That sentence is stale vs live npm. **Treat the 2026-08-17 registry check as authoritative for publish state.** npm 2.1.0 tarball `gitHead` is `fd19cad` (audit clone was `dfeb478`) — **NEEDS VERIFICATION** if you claim the tarball matches `master` line-for-line.

#### Public API surface (`sdks/node/packages/sdk/src/index.ts`)

| Export | Kind | File |
| --- | --- | --- |
| `FireweaveClient` | class | `src/client.ts` |
| `ControlPointsApi` | class (via `client.controlPoints`) | `src/client.ts` |
| `FireweaveRuntime` | class | `src/runtime.ts` |
| `FireweaveProvider` | OpenFeature `Provider` | `src/provider.ts` |
| `FireweaveRemoteAdapter` | class | `src/adapters/remote.ts` |
| `InMemoryAdapter` | class | `src/adapters/inmemory.ts` |
| `FireweaveLocalAdapter` | class | `src/adapters/local.ts` |
| `makeFireweaveLocalProvider`, `getFwLocalCaptures`, `resetFwLocalCaptures` | functions | `src/local-provider.ts` |
| `FireweaveError`, `ERROR_TAXONOMY`, `redactSecrets`, `isFireweaveError` | errors | `src/errors.ts` |
| `DEFAULT_ALLOWED_HOSTS`, `assertHostAllowed`, `isLoopbackHostname` | hosts | `src/hosts.ts` |
| Context helpers | `mergeContexts`, `canonicalizeContext`, … | `src/context.ts` |

**No `./posthog` subpath** in `package.json#exports` (only `"."`). Confirmed by `exports` block and CHANGELOG breaking change #1.

#### Evaluation types actually implemented

`ExpectedFlagType` / `FlagValueType` (`src/runtime.ts:32`, `src/types.ts:6`):

- `'boolean'`
- `'string'`
- `'number'` — **single number resolver** (IEEE-754 double). Integers beyond ±(2^53−1) are not lossless. Two conformance skips.
- `'object'`

`ControlPointsApi` methods (`src/client.ts:359–395`):

- `evaluate(flagKey, expectedType, defaultValue, context?, options?) → Promise<Decision>`
- `getBooleanValue` / `getStringValue` / `getNumberValue` / `getObjectValue`

`EvaluateOptions` (`src/runtime.ts:61–73`): `includePayload?`, `sendExposure?` (default **false**), `signal?`.

`client.flags` is a getter that returns the **same object** as `client.controlPoints` (`src/client.ts:514–516`).

#### Initialization / shutdown / flush

- `FireweaveRuntime.initialize(signal?)` / `shutdown()`
- `FireweaveClient.initialize(signal?)` / `shutdown()` — **shutdown flushes exposures first** (`src/client.ts:549–551`)
- `exposures.flush(signal?)`
- Default shutdown timeout: `DEFAULT_SHUTDOWN_TIMEOUT_MS = 10000` (`src/runtime.ts:59`)

Lifecycle states (`src/types.ts:49–56`): `UNINITIALIZED` | `INITIALIZING` | `READY` | `STALE` | `ERROR` | `FATAL` | `SHUTDOWN`.

#### Targets

`FireweaveRuntime.registerTarget(targetingKey, options?)` (`src/runtime.ts:343+`).  
`RegisterTargetOptions` (`src/adapter.ts:7–15`): `kind?: 'user' | 'device'`, `properties?`, `environment?`, `signal?`.  
Returns `{ ok, error? }` — **never throws** (login-path contract).  
Wire: `POST /v1/targets/register`.

#### Releases / exposures / signals / capabilities

`FireweaveClient` namespaces (`src/client.ts:497–504`):

- `releases.setContext(context)` / `start` / `complete` / `fail` — `ReleaseContext` requires `rolloutId` (1–128 chars) and `stampIds` (`stmp_` + 26 Crockford chars, 1–64 unique). Optional `changeId` (`chg_` + 26).
- `exposures.record` / `flush`
- `signals.record` / `recordHealth` / `recordError` / `recordMetric` / `recordOutcome`
- `guardrails.evaluate` — always `UnsupportedCapability`
- `capabilities.get()` / `list()`
- `invokeCapability(name)`

Signal attribute allowlist **on by default** (`DEFAULT_SIGNAL_ATTRIBUTE_ALLOWLIST`, `src/client.ts:54–69`): `name`, `kind`, `status`, `value`, `unit`, `rolloutId`, `changeId`, `stampId`, `errorKind`, `message`, `flagKey`, `variant`, `environment`, `service`.

#### Config options and env vars (exact names from code)

`FireweaveRemoteAdapterOptions` (`src/adapters/remote.ts:48–70`):

| Option | Env | Default |
| --- | --- | --- |
| `apiUrl` | `FW_API_URL` | required (empty → config error on init) |
| `apiKey` | `FW_PROJECT_API_KEY` | required |
| `allowedHosts` | — | hostname of `apiUrl` + loopback |
| `requestTimeoutMs` | — | `3000` |
| `shutdownTimeoutMs` | — | `10000` |
| `fetch` | — | injected (tests) |

`FireweaveRuntimeConfig` (`src/runtime.ts:34–56`): `projectApiKey?`, `host?`, `allowedHosts?`, `requireTargetingKey?`, `limits?`, `reservedAttributeKeys?`, `shutdownTimeoutMs?`.

Other env:

- `FW_DEPRECATION_WARNINGS=1` — one notice per process when `client.flags` is used (`src/client.ts:487–494`).
- Deno: `readEnv()` treats denied `--allow-env` as absence (`src/env.ts`, documented in `docs/runtimes.md`).

`DEFAULT_ALLOWED_HOSTS` (`src/hosts.ts:25–31`): `app-server.fireweave.ai`, `staging-app-server.fireweave.ai`, `localhost`, `127.0.0.1`, `::1`.  
`https` required off-loopback; `http` on loopback only.

Auth on the wire: `Authorization: Bearer <key>` (`src/adapters/remote.ts:9`). Spec also accepts `x-api-key` (`spec/remote-protocol.md`).

#### Error types

Single class `FireweaveError` with kind union (`src/errors.ts:10–25`) — 15 kinds:

`NotReady`, `FlagNotFound`, `TypeMismatch`, `InvalidContext`, `Authentication`, `Authorization`, `RateLimited`, `Timeout`, `Network`, `BackendUnavailable`, `MalformedResponse`, `UnsupportedCapability`, `Configuration`, `AlreadyClosed`, `Internal`.

Evaluation **never throws** — errors become `Decision` with `reason: ERROR`.

#### OpenFeature

`FireweaveProvider` (`src/provider.ts`): `runsOn = 'server'`, metadata name `'fireweave'`.

Resolvers: `resolveBooleanEvaluation`, `resolveStringEvaluation`, `resolveNumberEvaluation`, `resolveObjectEvaluation`.

Options (`FireweaveProviderOptions`): `includePayload?`, `sendExposure?` (default false), `lazyReady?` (default **true**).

#### Local / testing adapters

- `InMemoryAdapter({ flags, fault?, initError?, initGate? })`
- `FireweaveLocalAdapter` + `makeFireweaveLocalProvider()` — `devFlags: Record<string, boolean>`; unknown keys → caller default with reason `DEFAULT` (rewrites `FLAG_NOT_FOUND`).

---

### 2.2 Python — `fireweave`

**Paths:** `sdks/python/`  
**Core:** zero runtime dependencies.  
**Extras** (`pyproject.toml`):

- `fireweave[posthog]` → `posthog==7.31.0`
- `fireweave[openfeature]` → `openfeature-sdk>=0.10.0,<0.11` (**pre-1.0**)
- `fireweave[dev]` → both + pytest

#### Install (from README / quickstart)

**Live 2026-08-17:** PyPI has `fireweave==0.1.0`. `pip install 'fireweave[openfeature]'` is valid. Checkout (`docs/quickstart.md`) remains an alternative:

```bash
python -m venv .venv
.venv/bin/pip install -e 'sdks/python[openfeature]'   # add ,posthog for the PostHog adapter
```

Dev (`sdks/python/README.md`): `pip install -e '.[dev]'`.

#### Public API surface (`src/fireweave/__init__.py`)

| Export | File |
| --- | --- |
| `FireweaveClient`, result dataclasses | `client.py` |
| `FireweaveRuntime`, `EvaluationOptions`, `LifecycleState` | `runtime.py` |
| `FireweaveConfig`, `DEFAULT_ALLOWED_HOSTS` | `config.py` |
| `InMemoryAdapter`, `FireweaveRemoteAdapter`, `FireweaveLocalAdapter`, `RegisterTargetOptions`, `RegisterTargetResult` | `adapters/` |
| `EvaluationContext`, `Decision`, `Reason`, `FlagType` | `context.py`, `decision.py`, `types.py` |
| 15 error classes + `ErrorKind` | `errors.py` |

**Not in `__init__.__all__`:** `fireweave.aio.AsyncFireweaveClient` (import from `fireweave.aio`).  
**Not in core `__init__`:** `FireweaveProvider` — `from fireweave.openfeature import FireweaveProvider` (requires extra).  
**Not in core `__init__`:** `PostHogAdapter` — `from fireweave.adapters.posthog import PostHogAdapter` (requires extra).

#### Evaluation types actually implemented

`FlagType` (`types.py:20–27`): `BOOLEAN`, `STRING`, `INTEGER`, `FLOAT`, `OBJECT`.

`client.control_points` / `client.flags` (`client.py:631–726`):

- `get_boolean_value` / `get_string_value` / `get_integer_value` / `get_float_value` / `get_object_value`
- `get_details` / `evaluate` (Decision-returning)

Async wrappers on `AsyncFireweaveClient` (`aio.py`) offload via `asyncio.to_thread`.

#### Initialization / shutdown / flush

- `client.initialize(backend_required=False)`
- `client.shutdown(timeout_ms=None)` — flushes exposures, then closes adapter; **never raises**; idempotent
- Context manager: `with FireweaveClient(runtime) as client`
- `exposures.flush()` → `FlushResult`
- Default shutdown: `SHUTDOWN_TIMEOUT_MS_DEFAULT = 10_000`

#### Targets

`FireweaveRuntime.register_target(targeting_key, options?)` (`runtime.py:244+`).  
`FireweaveRemoteAdapter.register_target` — `POST /v1/targets/register`, **one retry** on retryable failures, returns `{ok: false}` rather than raising (`adapters/remote.py:151+`).

`RegisterTargetOptions`: `kind`, `properties`, `environment` (`adapters/base.py:29–38`).

#### Releases / exposures / signals

Snake_case on namespaces:

- `releases.set_context(rollout_id, change_id=None, stamp_ids=())` / `start` / `complete` / `fail`
- `exposures.record` / `flush`
- `signals.record_health` / `record_error` / `record_metric` / `record_outcome`
- `guardrails.check` / `evaluate` — stub
- `capabilities.get`

#### Config and env vars

`FireweaveConfig` (`config.py:40–65`):

- `project_api_key`, `host`, `personal_api_key`, `secret_key`
- `local_evaluation`, `only_evaluate_locally`
- `require_targeting_key`, `allow_anonymous`
- `allowed_hosts` (default `DEFAULT_ALLOWED_HOSTS` = five PostHog hosts + loopback)
- `reserved_attribute_keys`, `limits`
- `feature_flags_request_timeout_ms` (default 3000)
- `shutdown_timeout_ms` (default 10000)

`FireweaveRemoteAdapter` reads `FW_API_URL` and `FW_PROJECT_API_KEY` when options omitted (`adapters/remote.py:66–67`).

`FW_DEPRECATION_WARNINGS=1` for `client.flags` alias (`client.py:527`, `760`).

**Example-only env (not SDK core):** `FIREWEAVE_POSTHOG_KEY`, `FIREWEAVE_POSTHOG_HOST` in `examples/python/service.py` and `fastapi_app.py`. Do not document these as SDK configuration.

#### Error types

`ErrorKind` has the same 15 PascalCase kinds. Concrete subclasses: `NotReadyError`, `FlagNotFoundError`, `TypeMismatchError`, `InvalidContextError`, `TargetingKeyMissingError` (subtype of `InvalidContextError`, OF code `TARGETING_KEY_MISSING`), `AuthenticationError`, `AuthorizationError`, `RateLimitedError`, `TimeoutError_`, `NetworkError`, `BackendUnavailableError`, `MalformedResponseError`, `UnsupportedCapabilityError`, `ConfigurationError`, `AlreadyClosedError`, `InternalError`.

#### OpenFeature

`fireweave.openfeature.FireweaveProvider` — `resolve_boolean_details`, `resolve_string_details`, `resolve_integer_details`, `resolve_float_details`, `resolve_object_details`.  
Ctor: `backend_required=False`, `include_payload=False`.  
Local: `make_fireweave_local_provider()`, `get_fw_local_captures()`, `reset_fw_local_captures()`.

---

### 2.3 Go — `github.com/FireWeave-HQ/fireweave-sdk/sdks/go`

**Paths:** `sdks/go/`  
**Requires:** `github.com/open-feature/go-sdk v1.17.2`, `github.com/posthog/posthog-go v1.22.0`.

#### Install (from `docs/quickstart.md`)

Until the module path is public, use a `replace`:

```
require github.com/FireWeave-HQ/fireweave-sdk/sdks/go v0.0.0
replace github.com/FireWeave-HQ/fireweave-sdk/sdks/go => ../fireweave-sdk/sdks/go
```

No `go get` of a published version is documented as working.

#### Public packages

| Package | Responsibility |
| --- | --- |
| `…/fireweave` | `Runtime`, `Client`, types, errors |
| `…/openfeature` | `Provider` (`NewProvider(client)`) |
| `…/adapters/inmemory` | fixture adapter |
| `…/adapters/remote` | fw-server HTTP |
| `…/adapters/posthog` | PostHog escape hatch |

#### Evaluation types actually implemented

`FlagType` (`fireweave/decision.go:6–12`): `"boolean"`, `"string"`, `"integer"`, `"float"`, `"object"`.

Native API: `client.Flags().Evaluate(ctx, flagKey, flagType, defaultValue, evalCtx, opts)` only (`client.go:208`).  
**No** `GetBooleanValue`-style helpers on `Flags`.  
`EvaluateOptions`: `IncludePayload`, `SendExposure *bool`.

OpenFeature: `BooleanEvaluation`, `StringEvaluation`, `FloatEvaluation`, `IntEvaluation` (`int64`), `ObjectEvaluation` (`openfeature/provider.go:90–130`).

Payload via `fireweave.WithIncludePayload(ctx)` (Go context; OF has no per-call provider options).

#### Initialization / shutdown / flush

- `runtime.Initialize(ctx)` / `Flush(ctx)` / `Shutdown(ctx)`
- `client.Exposures().Flush(ctx)`
- Provider: `Init` / `InitWithContext`, `Shutdown` / `ShutdownWithContext`
- Every blocking call takes `context.Context`

#### Targets

**No `RegisterTarget` / `register_target` symbol in `sdks/go`.** Confirmed by repo-wide search. Compatibility matrix: “⏳ planned.”

Remote adapter paths (`adapters/remote/remote.go:20–23`): `/v1/flags/evaluate`, `/v1/capture` only.

#### Releases / exposures / signals

- `client.Releases().SetContext/Start/Complete/Fail` — **returns `error`**, not a result struct
- `client.Exposures().Record/Flush/Pending`
- `client.Signals().RecordHealth/RecordError/RecordMetric/RecordOutcome`
- `client.Guardrails().Check` — stub
- `client.Capabilities().Get()` / `Operations()` / `Invoke`

#### Config and env vars

`fireweave.Config` (`runtime.go:23–33`): `Limits`, `RequireTargetingKey`, `GlobalContext`. **No API URL/key on the runtime.**

`adapters/remote.Config` (`remote.go:26–39`): `APIURL` (env `FW_API_URL`), `APIKey` (env `FW_PROJECT_API_KEY`), `AllowedHosts`, `RequestTimeout` (default 3s), `CloseTimeout` (default 10s), `HTTPClient`.

`adapters/posthog.Config` (`posthog.go:89–121`): `ProjectAPIKey`, `SecretKey`, `Endpoint`, `AllowedHosts`, `LocalEvaluationOnly`, `FlagRequestTimeout`, `FlagRequestRetries` (default 0), `SendExposureEvents` (default false), `CloseTimeout`, `Transport`.

**Example-only env:** `FW_POSTHOG_HOST`, `FW_SECRET_KEY` in `examples/go/main.go`. Not read by the remote adapter.

Default PostHog allowlist: five PostHog hosts + loopback (`posthog.go:75–79`).

#### Error types

`fireweave.Error` with `ErrorKind` constants (`errors.go:48–64`) — same 15 kinds. Implements `error`.

#### OpenFeature

Package `openfeature`, type `Provider`, constructor `NewProvider(*fireweave.Client)`.  
Metadata + reserved-key guard hook (`hook.go`).  
**No** `controlPoints` naming.

---

### 2.4 Java — `ai.fireweave:*`

**Modules** (`sdks/java/pom.xml`):

| Artifact | Contents |
| --- | --- |
| `fireweave-sdk` | core — **zero runtime deps** |
| `fireweave-openfeature` | `FireweaveProvider` on `dev.openfeature:sdk` **1.15.1** (newest on Maven Central as of 2026-07-27; decision brief wanted 1.21.0) |
| `fireweave-adapter-posthog` | `PostHogAdapter` over `PostHogClientApi` seam |
| `fireweave-testing` | `InMemoryAdapter`, conformance runner |

#### Install (from README / quickstart)

```bash
cd sdks/java && mvn install
```

```xml
<dependency>
  <groupId>ai.fireweave</groupId>
  <artifactId>fireweave-sdk</artifactId>
  <version>0.1.0-SNAPSHOT</version>
</dependency>
<dependency>
  <groupId>ai.fireweave</groupId>
  <artifactId>fireweave-openfeature</artifactId>
  <version>0.1.0-SNAPSHOT</version>
</dependency>
```

Not on Maven Central.

#### Public API (core `ai.fireweave.sdk`)

`FireweaveClient` (`FireweaveClient.java`):

- `evaluate(flagKey, FlagType, JsonValue default, EvaluationContext, EvaluationOptions) → Decision`
- `getBooleanValue` / `getStringValue` only — **no** `getIntegerValue` / `getDoubleValue` / `getObjectValue` on the native client
- `releases()` / `exposures()` / `signals()` / `guardrails()` / `capabilities()`
- `invokeCapability`
- `close()` → `runtime.shutdown()` — Javadoc: “flushes nothing implicitly”

`FlagType` (`FlagType.java`): `BOOLEAN`, `STRING`, `INTEGER`, `FLOAT`, `OBJECT`.

`EvaluationOptions`: `sendExposure()` (default false), `includePayloadMetadata()`.

#### Initialization / shutdown / flush

- `FireweaveRuntime.initialize()` / `shutdown()` / `close()`
- Shutdown waits at most `shutdownTimeoutMs` (default 10_000) on a daemon thread
- `exposures().flush()` is explicit
- Client implements `AutoCloseable`

#### Targets

**No `registerTarget` in Java sources on `master`.** Remote adapter paths (`FireweaveRemoteAdapter.java:29–30`): `/v1/flags/evaluate`, `/v1/capture` only.

#### Config and env vars

`FireweaveConfig` fields (`FireweaveConfig.java:41–57`): `projectApiKey`, `personalApiKey`, `host`, `allowedHosts`, `requireTargetingKey`, `limits`, `reservedAttributeKeys`, `globalContext`, `localEvaluation`, `onlyEvaluateLocally`, `requestTimeoutMs` (3000), `shutdownTimeoutMs` (10000), `defaultEvaluationOptions`, `telemetryAttributeAllowlist`, `releasesEnabled`, `exposuresEnabled`, `signalsEnabled`.

**Confirmed absence:** no `System.getenv` anywhere under `sdks/java`. Java does **not** auto-read `FW_API_URL` / `FW_PROJECT_API_KEY`. Javadoc on `FireweaveRemoteAdapter` *equates* `host()` / `projectApiKey()` to those names for documentation.

`DEFAULT_ALLOWED_HOSTS`: five PostHog hosts + loopback. Opt-out: `ALLOW_ANY_HOST = "*"`.

#### Error types

`ErrorKind` enum (15 kinds) + `FireweaveException` + `FireweaveError` value type. Evaluation path returns defaults; extensions return `ExtensionResult`.

#### OpenFeature

`ai.fireweave.openfeature.FireweaveProvider` — five resolvers: boolean, string, **integer (`Integer`, 32-bit)**, double, object (`Value`).  
Values outside `Integer` range → `TYPE_MISMATCH` + default (never silent truncation). One conformance skip.  
`InitMode.AUTOMATIC` | `MANUAL`. Synchronous (no `CompletionStage`).

#### PostHog adapter

`PostHogAdapter.create(config)` → `UnsupportedCapability` until a Java server SDK exists. Production use requires injected `PostHogClientApi`.

---

### 2.5 Web — `@fireweaveai/web-sdk`

**Paths:** `sdks/web/packages/sdk/`  
**Peer:** `@openfeature/web-sdk` `^1.9.0`. Zero runtime deps.  
**Live 2026-08-17:** npm `@fireweaveai/web-sdk@2.1.0` is published (`gitHead` dfeb478). `npm install @fireweaveai/web-sdk@2.1.0` is valid. No install command in a web-specific README in the tree — package name and version are from `package.json` + live registry.

#### Public API (`src/index.ts`)

- `FireweaveWebClient`, `WebControlPointsApi`, `WebExposuresApi`, `WebSignalsApi`, `WebReleasesApi`
- `FireweaveWebRuntime`, `FireweaveWebProvider`
- `FireweaveRemoteWebAdapter`, `InMemoryWebAdapter`, `FireweaveLocalWebAdapter`
- Same 15-kind `FireweaveError`

#### Evaluation types

`ExpectedFlagType`: `'boolean' | 'string' | 'number' | 'object'` — **synchronous** `evaluateSync` / `getBooleanValue` / `getStringValue` / `getNumberValue` / `getObjectValue` (`src/client.ts`).

OpenFeature: `resolve*Evaluation` returns `ResolutionDetails`, **never a Promise** (`src/provider.ts:105–135`). Provider metadata default name: `fireweave-web`. `runsOn = 'client'`.

#### Targets

`FireweaveWebClient.identify(targetingKey, options?)` → `runtime.registerTarget` then `setContext({ targetingKey })` (`src/client.ts:392–398`).

#### Lifecycle difference

Adds **`STALE`**: prefetch raced a ceiling (`DEFAULT_FLAGS_READY_TIMEOUT_MS = 5000`) and lost; reads are defaults with reason `STALE`. Collapsing STALE into READY is explicitly rejected in comments (`src/runtime.ts:9–21`).

Unload flush: `visibilitychange → hidden` and `pagehide`, `keepalive` / `sendBeacon`. `shutdown()` flushes then shuts down.

#### Config

`FireweaveRemoteWebAdapterOptions`: **`apiUrl` and `apiKey` are required constructor fields.** No env reads. Rejects `phc_`/`phs_`/`phx_` key shapes (`assertNotSecretKey`).

CHANGELOG / spec: browser key must eventually be a scoped `fw_public_…` family. **Today’s key family is still `project-api-key_…` / attest.** Spec: “Depends on platform work” before production browser use.

#### Confirmed absences (web)

- No environment-variable configuration
- No PostHog / vendor adapter
- No in-process local evaluation
- No server entry point

---

## 3. Shared concepts mapped to actual APIs

| Concept | Node | Python | Go | Java | Web |
| --- | --- | --- | --- | --- | --- |
| Client | `FireweaveClient` | `FireweaveClient` / `AsyncFireweaveClient` | `fireweave.Client` (`NewClient`) | `FireweaveClient` | `FireweaveWebClient` |
| Runtime | `FireweaveRuntime` | `FireweaveRuntime` | `fireweave.Runtime` (`NewRuntime`) | `FireweaveRuntime` | `FireweaveWebRuntime` |
| Evaluate (native) | `client.controlPoints.getBooleanValue` / `evaluate` | `client.control_points.get_boolean_value` / `evaluate` | `client.Flags().Evaluate` | `client.evaluate` / `getBooleanValue` / `getStringValue` | `client.controlPoints.getBooleanValue` (**sync**) |
| Evaluate (OF) | `FireweaveProvider` + `@openfeature/server-sdk` | `fireweave.openfeature.FireweaveProvider` | `openfeature.NewProvider` + `go-sdk` | `ai.fireweave.openfeature.FireweaveProvider` | `FireweaveWebProvider` + `@openfeature/web-sdk` |
| Flag key name at OF / wire / spec | `flagKey` (not `controlPointKey`) — ADR-0007 | same | same | same | same |
| Register target | `runtime.registerTarget` | `runtime.register_target` | **none** | **none** | `client.identify` |
| Remote adapter | `FireweaveRemoteAdapter` | `FireweaveRemoteAdapter` | `adapters/remote.New` | `FireweaveRemoteAdapter` | `FireweaveRemoteWebAdapter` |
| In-memory | `InMemoryAdapter` | `InMemoryAdapter` | `adapters/inmemory.New` | `ai.fireweave.testing.InMemoryAdapter` | `InMemoryWebAdapter` |
| Dev/local | `FireweaveLocalAdapter` / `makeFireweaveLocalProvider` | `FireweaveLocalAdapter` / `make_fireweave_local_provider` | **none** | **none** | `FireweaveLocalWebAdapter` |
| PostHog escape hatch | **removed** | `PostHogAdapter` | `adapters/posthog` | seam only | **none** |
| Releases | `client.releases.*` | `client.releases.*` | `client.Releases().*` | `client.releases().*` | `WebReleasesApi` |
| Exposures | `client.exposures.record/flush` | `client.exposures.record/flush` | `client.Exposures().Record/Flush` | `client.exposures().record/flush` | `WebExposuresApi` + unload flush |
| Signals | `recordHealth/Error/Metric/Outcome` | `record_health/error/metric/outcome` | `RecordHealth/Error/Metric/Outcome` | `recordHealth/Error/Metric/Outcome` | `WebSignalsApi` |
| Capabilities | `client.capabilities.get()` | `client.capabilities.get()` | `client.Capabilities().Get()` | `client.capabilities()` | `WebCapabilitiesApi` |
| Guardrails | stub | stub | stub | stub | stub |
| Shutdown | `await client.shutdown()` (flushes) | `client.shutdown()` (flushes) | `runtime.Shutdown(ctx)` | `client.close()` / `runtime.shutdown()` (no implicit flush) | `await client.shutdown()` (flushes) |
| Auth | Bearer `FW_PROJECT_API_KEY` | Bearer / config | Bearer / config | Bearer via `FireweaveConfig` (no env auto-read) | Bearer via ctor only |

### Wire protocol (spec + adapters)

From `spec/version.json` and `spec/remote-protocol.md`:

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/flags/evaluate` | Batch evaluation (side-effect-free) |
| `POST` | `/v1/capture` | Exposures / signals / events |
| `POST` | `/v1/targets/register` | Register user/device (Node, Python, Web adapters only on `master`) |

Auth: `Authorization: Bearer <Fireweave project/runtime key>`. Also accepted: `x-api-key`.  
Current key prefix documented: `project-api-key_…`.  
**Never** send PostHog `phc_` / `phs_` / `phx_` on this path.

Context merge (server SDKs): config global → client → invocation. Bounds (contracts): 128 attributes / 256 B keys / 4 KiB values / depth 6 / 64 KiB serialized.  
Canonical group keys: `fireweave.groups`, `fireweave.groupProperties` (plain `groups` / `groupProperties` alias). Other `fireweave.*` keys → `InvalidContext`.

Exposure default: **opt-in** (`sendExposure` / `send_exposure` / `SendExposure` default false). Phase-one OF evaluate is side-effect-free.

---

## 4. OpenFeature

**Present in all five packages.**

| Binding | Provider type | OF SDK pin | Resolvers |
| --- | --- | --- | --- |
| Node | `FireweaveProvider` | `@openfeature/server-sdk` ^1.22.0 (peer) | boolean, string, **number**, object |
| Python | `FireweaveProvider` | `openfeature-sdk` ≥0.10,<0.11 extra | boolean, string, **integer**, **float**, object |
| Go | `openfeature.Provider` | `go-sdk` v1.17.2 | boolean, string, float, **int64**, object |
| Java | `FireweaveProvider` | `dev.openfeature:sdk` 1.15.1 | boolean, string, **32-bit Integer**, double, object |
| Web | `FireweaveWebProvider` | `@openfeature/web-sdk` ^1.9.0 (peer) | boolean, string, **number**, object — **sync** |

Verified OF features (`docs/compatibility.md` + providers):

- Typed resolvers + detailed resolution + `flagMetadata` — yes
- Provider initialize/shutdown — yes
- Hooks: user-registered yes; Fireweave ships **no product hooks** except Go’s reserved-key **guard** hook
- Domains / named clients — providers are domain-safe
- Events READY / ERROR / STALE / CONFIG_CHANGED — as supported by each OF SDK (web emits `Stale` and `ConfigurationChanged`)
- Transaction context — “usable where the OF SDK ships it; no Fireweave dependency”
- Multi-provider — “compatible where OpenFeature ships it (Node); **untested on Python**”
- **Tracking (OF spec §6): planned — not implemented**

ADR-0003: Fireweave extensions (releases, exposures, signals, targets, capabilities) live on `FireweaveClient`, **not** on the OF client.

The per-call parameter is `flagKey`, not `controlPointKey` (ADR-0007). Docs must keep that duality explicit.

---

## 5. Testing infrastructure

### InMemoryAdapter

Present in all languages (Java: `fireweave-testing`). Fixture fields used in tests/docs: `type`, `enabled`, `value`, `variant`, optional `matchAttribute` / `MatchAttributes`, payload, metadata. Node also: typed `fault`, `initError`, `initGate`, `setFlags()`.

### Local / dev adapter

Node + Python + Web only (see §2). Resolution: key in `devFlags` → mapped boolean + `STATIC`; else caller default + `DEFAULT`. `FLAG_NOT_FOUND` rewritten to `DEFAULT` in local provider only.

### Test server (`test-server/`)

Zero-dep Node stub: `test-server/implementation/server.mjs`.

**Implemented Fireweave-native routes** (`PATHS.md` + `server.mjs`):

- `POST /v1/flags/evaluate`
- `POST /v1/capture`
- `GET /health`

**Implemented vendor (PostHog) routes** (`test-server/README.md`):

- `POST /flags?v=2`
- `GET /api/feature_flag/local_evaluation?token=…`
- `POST /batch/`
- Fault modes via `X-Fw-Test-Fault` / `?fault=` / `POST /_test/fault`

**Confirmed absence:** `POST /v1/targets/register` is **not** in `server.mjs` (search of `test-server/` found no matches). `docs/testing.md` claims the stub serves that route. That doc is **wrong relative to implementation**. Spec/SDK register-target tests use mocks/injected fetch, not this stub.

Harness env (Go): `FIREWEAVE_TEST_SERVER_URL` or `FW_TEST_SERVER_URL` (`sdks/go/internal/conformance/faults.go`).

### Conformance

`contracts/` — 65 fixtures (evaluation, context, lifecycle, faults, security, extensions) + `contracts/web/` (10). Runners per language; CI job `differential` compares reports.

### Examples (`examples/`)

| Lang | Files | Default |
| --- | --- | --- |
| Node | `examples/node/index.mjs` | offline; `--remote` hits stub |
| Python | `service.py`, `fastapi_app.py` | offline; PostHog if example env set |
| Go | `examples/go/main.go` | offline; PostHog if example env set |
| Java | `examples/java` Maven exec | offline |

---

## 6. CHANGELOG / migration notes (quoted, not inferred)

From `CHANGELOG.md` **[Unreleased]** / Node 2.1.0:

> `@fireweaveai/sdk` is on npm at **0.1.0** (2026-08-03) and **2.0.0** (2026-08-05), with `latest` pointing at 2.0.0. **2.1.0 is not published yet**, so an unpinned `npm install @fireweaveai/sdk` still resolves to 2.0.0 — the API that carries the direct PostHog adapter and the `./posthog` subpath. The Python, Go, and Java packages remain unpublished.

> The work below was drafted as `3.0.0` and `3.1.0` and is released as a single **2.1.0** instead.

**Node 2.1 breaking (exactly three, quoted):**

1. `@fireweaveai/sdk/posthog` no longer resolves. Replace `PostHogAdapter` with `FireweaveRemoteAdapter`; env vars `POSTHOG_HOST`/`POSTHOG_API_KEY` become `FW_API_URL`/`FW_PROJECT_API_KEY`.
2. `posthog-node` is no longer a peer dependency.
3. `'posthog'` is no longer a member of `BackendAdapter['name']` or `Capabilities['runtime']['backend']`.

**Removed capability (quoted):**

> **In-process local evaluation.** The vendor adapter's secret-key mode … has no replacement; caching is fw-server's concern and both shipped adapters report `localEvaluation: false`.

**Not breaking (quoted):**

> `client.flags` still exists and **is** `client.controlPoints` — same object, not a copy. Marked `@deprecated` in JSDoc only; **not scheduled for removal in 2.x**.

From `docs/migration.md` mapping table:

| Before | After |
| --- | --- |
| `POSTHOG_HOST` | `FW_API_URL` |
| `POSTHOG_API_KEY` (`phc_…`) | `FW_PROJECT_API_KEY` (`project-api-key_…`) |
| `featureFlagsRequestTimeoutMs` | `requestTimeoutMs` |
| `secretApiKey` / `onlyEvaluateLocally` / `featureFlagsPollingInterval` | no equivalent |

> **The new key is a Fireweave project key, not a re-labelled vendor key.**

`DEFAULT_ALLOWED_HOSTS` **contents changed** while the export name stayed (Fireweave hosts, not vendor hosts).

Python CHANGELOG (Aug 2026, still `0.1.0`): added `register_target`, `client.control_points`, `FireweaveLocalAdapter` + `make_fireweave_local_provider()`. PostHog extra retained.

Known limitations (CHANGELOG, quoted):

> - Java's PostHog adapter cannot be constructed from config alone (`UnsupportedCapability`) until PostHog publishes a Java server SDK …
> - Guardrails are a typed stub in every language (phase one).
> - Package names and the MIT license await company ratification; publication is gated.

---

## 7. NEEDS VERIFICATION / BLOCKED

1. **Node 2.0.0 vs 2.1.0.** **Live 2026-08-17:** npm `latest` = **2.1.0**. **2.0.0** remains published and still has PostHog / `./posthog`. Pin `@2.1.0`. npm 2.1.0 `gitHead` is `fd19cad`, not audit clone `dfeb478` — **NEEDS VERIFICATION** if citing that tarball as identical to `master`.
2. **Python / Web published; Go / Java unpublished (live 2026-08-17).** PyPI `fireweave==0.1.0`; npm `@fireweaveai/web-sdk@2.1.0`. No verified Go proxy tag or Maven Central artifacts — those stay checkout / `mvn install`.
3. **`groupId ai.fireweave`** — POM: working assumption pending Maven Central namespace verification. DO NOT PUBLISH.
4. **License ratification** — README: do not redistribute built packages until ratified.
5. **fw-server production hosts.** Node allowlist names `app-server.fireweave.ai` and `staging-app-server.fireweave.ai`. Whether those hostnames are live, what TLS/auth they require, and whether they are the customer-facing URLs is **not verified from this repo alone**.
6. **Key families.** Spec: current key is `project-api-key_…` (attest/`attest:write`). Browser needs `fw_public_…` with `flags:evaluate` + `events:write` — “required before this is used against production.” Whether fw-server already issues `fw_public_…` is **platform work, not SDK-proven**.
7. **`x-api-key` header** — specified in `spec/remote-protocol.md`. Node remote adapter comments document Bearer. Whether every language adapter sends `x-api-key` as well as Bearer: **NEEDS VERIFICATION** per adapter (do not document as universally implemented).
8. **Java/Go `registerTarget`.** Absent on `master`. Local branch `java/sdk-parity-aug2026` (`9a2abb3 feat(java): SDK parity — control points, registerTarget, local provider`) is **not merged**. Do not document Java/Go target registration until it lands on `master`.
9. **Release/signal delivery skew** (`docs/compatibility.md` known gap #2): “Go (and Java via the adapter seam) deliver release transitions/signals to the backend telemetry sink; Node/Python may record some paths in-process only.” Verify per adapter before writing “signals always reach fw-server.”
10. **OpenFeature tracking (§6)** — planned, not present. Do not document.
11. **`docs/testing.md` vs test-server:** testing doc claims `/v1/targets/register` on the stub; implementation does not have it.
12. **`spec/remote-protocol.md` line 26** says register-target is “Node SDK only today.” Implementation on `master` also has Python + Web. Spec is stale.
13. **Root README vs live npm on Node publish.** README: “Not yet published.” **Live 2026-08-17:** `0.1.0`, `2.0.0`, and `2.1.0` are on npm; `latest` = 2.1.0. Prefer the live registry.
14. **Web `client.ts` contains a NUL byte** (file reads as binary). Implementation is present; editors/tools may mishandle it. Not a docs API issue; note for SDK maintainers.
15. **Go module version.** Quickstart uses `v0.0.0` + replace. Compatibility matrix says package version `0.1.0`. No git tag was inspected beyond `master` HEAD. **NEEDS VERIFICATION** of any existing tags.
16. **Java OF pin 1.15.1 vs brief 1.21.0** — document the actual pin (1.15.1), not the brief.
17. **CI “latest” / “stable” / “canary” cells** — exact Bun/Deno/Go versions float. Document minimums from manifests, not floating CI cells as support guarantees.
18. **Existing Fireweave product docs** (this repo) are placeholders. They must not be used as API evidence.
19. **Unmerged local SDK branch** at `/Users/niketh/Coding/fireweave-sdk/Untitled` (`java/sdk-parity-aug2026`) — do not treat as source of truth until merged.

---

## 8. CONFIRMED GAPS (absence proven in `master` sources)

These are things the implementation **does not have**. Safe to omit from docs; unsafe to invent.

1. **Go `registerTarget` / `RegisterTarget`** — no symbols under `sdks/go`.
2. **Java `registerTarget`** — no symbols under `sdks/java` on `master`.
3. **Go / Java `controlPoints` / `control_points` namespace** — Go is `Flags()`; Java has no such facade.
4. **Java native `getIntegerValue` / `getFloatValue` / `getObjectValue`** — only `getBooleanValue` and `getStringValue`; other types via `evaluate(...)` or OpenFeature.
5. **Go native typed getters** — only `Flags().Evaluate`.
6. **Node `./posthog` / `PostHogAdapter` / `posthog-node` peer** — removed in tree 2.1.0.
7. **Node in-process local evaluation** (`onlyEvaluateLocally`, secret-key definition poll) — removed; both shipped adapters report `localEvaluation: false`.
8. **Web env-var config** — structurally none.
9. **Web / Node vendor adapter** — none.
10. **Java `System.getenv` for `FW_*`** — none.
11. **Guardrails** — stub only (`UnsupportedCapability`) in every language.
12. **OpenFeature Tracking API (spec §6)** — not implemented.
13. **Test-server `POST /v1/targets/register`** — not implemented.
14. **Mobile / React Native / iOS / Android / Rust / .NET / PHP / Ruby SDKs** — no packages under `sdks/`.
15. **Published Go / Java registry packages** — still unpublished (2026-08-17). Python and `@fireweaveai/web-sdk` **are** published; do not repeat the stale “unpublished” claim for those two.
16. **Default-on exposure emission on evaluate/OF** — default is false (ruling 20).
17. **Java live PostHog from API keys alone** — `UnsupportedCapability`.

---

## 9. Recommended documentation pages (from actual functionality)

Do **not** generate pages for fictional IA. Recommended set:

| Page | Why it is real | Do not invent |
| --- | --- | --- |
| **Install / getting started** | Registry where live (Node/Web/Python, 2026-08-17); checkout for Go/Java; Node 2.0.0 vs 2.1.0 caveat | `go get` latest / Maven Central as if published |
| **Authentication & configuration** | `FW_API_URL`, `FW_PROJECT_API_KEY`, Bearer, allowlists, https/loopback | Java auto-env; web env; `fw_public_…` as if issued |
| **Initialize, ready, shutdown** | Lifecycle states, flush-on-shutdown differences (Java does not implicit-flush) | Identical shutdown semantics across languages |
| **Evaluate control points** | Native + OF; `flagKey` vs “control point”; type tables per language | `controlPointKey`; Java/Go `controlPoints` |
| **OpenFeature** | Providers exist in all five; resolver tables; `lazyReady`; domains/hooks as implemented | Tracking; Python multi-provider as tested |
| **Targets** | Node `registerTarget`, Python `register_target`, Web `identify` | Go/Java APIs; test-server register route |
| **Releases** | `setContext` / `start` / `complete` / `fail` + ULID rules | Backend delivery guarantees without checking gap #2 |
| **Exposures** | `record` / `flush` / dedup / `sendExposure` default false | Default emit-on-evaluate |
| **Signals & outcomes** | Four kinds + allowlist | Arbitrary PII attributes |
| **Capabilities** | `capabilities.get` matrix | Guardrails as a working feature |
| **Adapters** | Remote (default prod), InMemory (tests), Local/dev (Node/Python/Web), PostHog extra (Python/Go only) | Node PostHog; Java key-only PostHog |
| **Testing** | InMemoryAdapter + test-server routes that **exist** | `/v1/targets/register` on the stub |
| **Browser SDK** | Separate surface: sync reads, STALE, no env, `identify`, unload flush | “Same as server SDK”; production use without scoped public keys |
| **Errors** | 15-kind taxonomy + OF code map | Extra kinds |
| **Compatibility** | Language matrix from this audit + `docs/compatibility.md` | Pretend parity |
| **Migrate Node 2.0 → 2.1** | Quoted CHANGELOG / `docs/migration.md` | Invent other language breakages |
| **Runtimes (Node/Bun/Deno)** | `docs/runtimes.md` + CI + `engines` | Deno OF provider as smoke-tested (CI notes provider import is Node/Bun-gated) |

**Do not create pages for:** guardrails product, OF tracking, mobile SDKs, in-process Node local eval, Java/Go target registration, published PyPI/Maven/Go modules.

---

## Appendix A — Remote protocol sketch (from spec, not invented)

Evaluate request fields (`spec/remote-protocol.md`): `targetingKey`, `attributes`, `groups`, `groupProperties`, `flagKeys`.  
Register body: `targetingKey`, `kind`, `environment`, `properties`. Response: `{ "ok": true, "targetingKey": "…" }`.  
`fw_`-prefixed property keys reserved server-side (stripped).

## Appendix B — CI facts (`.github/workflows/ci.yml`)

Jobs: `node` (20, 24), `bun` (1.2.0, latest), `deno` (v2.x, canary), `web` (Bun), `python` (3.10, 3.14), `go` (1.25.x, stable), `java` (11, 25), `differential`, `integration` (test-server). Publishing hard-disabled in this workflow.

## Appendix C — TASKS.md

`TASKS.md` was not present in `/Users/niketh/Coding/docs.fireweave.ai`. Per instructions, it was not created. This file is the TASK-003 deliverable.
