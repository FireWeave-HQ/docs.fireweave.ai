# Fireweave documentation platform — task tracker

Official docs site for [docs.fireweave.ai](https://docs.fireweave.ai), served by Mintlify from this repository.

**Do not invent APIs, methods, packages, env vars, endpoints, auth, or SDK capabilities.** Source of truth is sibling audits (existing docs, SDK source, Mintlify research, terminology, IA) plus later page work.

## Legend

| Status | Meaning |
|--------|---------|
| `TODO` | Not started |
| `IN_PROGRESS` | Actively being worked (including by a sibling agent) |
| `BLOCKED` | Waiting on a dependency or decision |
| `DONE` | Completed and validated |

## Checkpoint 1 audits (complete)

Deliverables exist and were cross-checked before marking 002 / 003 / 032 / 004 / 005 DONE:

| Agent / task | Deliverable |
|--------------|-------------|
| 001 Repository audit | `audits/repository-audit.md` |
| 002 Existing documentation audit | `audits/existing-docs.md` |
| 003 SDK source audit (`master` `dfeb478`) | `audits/sdk-audit.md` |
| 004 Terminology | `audits/terminology.md` |
| 005 Information architecture | `audits/information-architecture.md` |
| 032 Mintlify platform research | `audits/mintlify-platform.md` |

**Do not treat in-app wrap/`fw.isOn`/ramp as canonical.** SDK audit did not confirm `fw.isOn`. Official SDKs: Node `@fireweaveai/sdk`, Python `fireweave`, Go `github.com/FireWeave-HQ/fireweave-sdk/sdks/go`, Java `ai.fireweave:*`, Browser `@fireweaveai/web-sdk`.

## Checkpoints

| Checkpoint | Scope | Exit criteria |
|------------|-------|---------------|
| **CHECKPOINT 1 — Repository + audits** | 001, 002, 003, 004, 032 | **Met.** Repo inventory written; existing-docs, SDK, terminology, and Mintlify research audits exist |
| **CHECKPOINT 2 — Architecture + platform** | 005, 006 | **Met.** IA agreed; `docs.json` is Fireweave-named (`navigation.groups`) |
| **CHECKPOINT 3 — Core pages** | 007–012, **033** | **Met.** Homepage, quickstart, and five language docs exist and were re-validated (links + publish state) |
| **CHECKPOINT 4 — Concepts + product** | 013–022 | **Met.** Concept, OpenFeature, testing, and production pages exist and were re-validated |
| **CHECKPOINT 5 — Cross-cutting** | 023–027 | **Met.** Troubleshooting, migration, reference, SEO frontmatter, navigation |
| **CHECKPOINT 6 — Validation + gaps** | 028–031 | **Met.** Internal links + examples + `mint validate` / `mint broken-links` + current `DOCUMENTATION_GAPS.md` |

---

## Tasks

| ID | Task | Status | Dependencies | Files affected | Validation | Notes |
|----|------|--------|--------------|----------------|------------|-------|
| 001 | Repository audit | DONE | — | `TASKS.md`, `audits/repository-audit.md` | Inspected git status/branch, local+remote branches, all tracked files, GitHub metadata, absence of CI/lockfiles/.gitignore; wrote inventory | Mintlify starter kit already present — not an empty repo. Do not overwrite starter files blindly. |
| 002 | Existing documentation audit | DONE | — | `audits/existing-docs.md` | Deliverable exists; five in-app pages inventoried from client JS; UNVERIFIED APIs labeled | Sibling audit complete. In-app wrap/`fw.isOn`/guardrail rollback are **not** SDK-canonical. |
| 003 | SDK source audit | DONE | — | `audits/sdk-audit.md` | Deliverable exists; no invented APIs; `master` only | Sibling audit complete. Trust this file + implementation over summaries. Web SDK verified. |
| 004 | Product/concept audit | DONE | 002, 003 | `audits/terminology.md` | Terminology matches audited docs + SDK; collisions explicit; no invented concepts | Canonical names: control point, target, release, exposure, signal, outcome (kind). `flagKey` stays at OF/wire. |
| 005 | Information architecture | DONE | 001, 002, 003, 004 | `audits/information-architecture.md` | IA covers validated topics only; omitted list has reasons; no fictional pages | Sitemap + nav groups proposed. **Do not apply to `docs.json` yet.** Added Web as 033. |
| 006 | Mintlify setup | DONE | 001, 005, 032 | `docs.json`, `.mintignore` | `mint validate` + `mint broken-links` passed on Node 20.19.4. Name is Fireweave. | Logos still starter assets (no Fireweave brand files). `mint preview` not run. Never add `mint.json`. |
| 007 | Homepage | DONE | 005, 006 | `index.mdx`, `introduction/how-it-works.mdx`, `introduction/architecture.mdx` | Page exists; internal links + publish state re-checked 2026-08-17 | Leads with npm 2.1.0 / PyPI 0.1.0 / web-sdk 2.1.0; Go/Java unpublished. |
| 008 | Quickstart | DONE | 003, 005, 006 | `quickstart.mdx` | Page exists; install leads with published registries | Register step gated to Node/Python/Web. |
| 009 | Node.js documentation | DONE | 003, 005, 006 | `sdks/node.mdx` | Page exists; 2.1.0 APIs; `latest` = 2.1.0 | Pin 2.1.0; 2.0.0 still has `./posthog`. |
| 010 | Python documentation | DONE | 003, 005, 006 | `sdks/python.mdx` | Page exists; `pip install 'fireweave[openfeature]'` | PyPI `0.1.0` published (2026-08-17). Checkout is an alternative. |
| 011 | Go documentation | DONE | 003, 005, 006 | `sdks/go.mdx` | Page exists; replace + checkout only | No `registerTarget`; `Flags()` only. |
| 012 | Java documentation | DONE | 003, 005, 006 | `sdks/java.mdx` | Page exists; `mvn install` 0.1.0-SNAPSHOT | No `registerTarget`; `close` does not flush; no getenv. |
| 033 | Browser / Web SDK documentation | DONE | 003, 005, 006 | `sdks/web.mdx` | Page exists; npm `@fireweaveai/web-sdk@2.1.0` | Sync reads, `identify`, STALE, no env, public-key warning. Not folded into Node. |
| 013 | Core concepts | DONE | 004, 005, 006 | `concepts.mdx` | Page exists; `CardGroup` replaced with `Columns` | Glossary landing; ADR-0007 duality. |
| 014 | Targeting | DONE | 003, 004, 005 | `concepts/targeting.mdx` | Page exists; no invented APIs | registerTarget gated to Node/Python/Web. |
| 015 | Control points | DONE | 003, 004, 005 | `concepts/control-points.mdx` | Page exists; `flagKey` not `controlPointKey` | Per-language type table. |
| 016 | Releases | DONE | 003, 004, 005 | `concepts/releases.mdx` | Page exists | Delivery skew remains NEEDS VERIFICATION. |
| 017 | Exposures | DONE | 003, 004, 005 | `concepts/exposures.mdx` | Page exists; `sendExposure` default **false** | |
| 018 | Signals | DONE | 003, 004, 005 | `concepts/signals.mdx` | Page exists | health / error / metric / outcome kinds. |
| 019 | Outcomes | DONE | 003, 004, 005 | `concepts/signals.mdx` (outcomes section) | No standalone page | Outcome is a signal kind + release complete. |
| 020 | OpenFeature | DONE | 003, 005 | `openfeature.mdx` | Page exists; no `track()` | All five providers. Java pin 1.15.1. |
| 021 | Testing | DONE | 003, 005 | `testing.mdx` | Page exists; stub does **not** implement `/v1/targets/register` | |
| 022 | Production | DONE | 003, 005 | `production/configuration.mdx`, `production/lifecycle.mdx`, `production/errors.mdx` | Pages exist; Java `close()` does not flush | No console ramp/guardrails. |
| 023 | Troubleshooting | DONE | 008–022 | `troubleshooting.mdx` | Page exists; issues map to real pages/APIs | |
| 024 | Migration | DONE | 003 | `migration/node-2.mdx` | Page exists; CHANGELOG breakages only | 2.0.0 → 2.1.0; `./posthog` gone on 2.1. |
| 025 | Reference | DONE | 003, 009–012, 033 | `reference/packages.mdx`, `sdks/compatibility.mdx` | Pages exist; publish state current | No OpenAPI playground. |
| 026 | SEO | DONE | 007–025, 033 | frontmatter, `docs.json` | Every MDX page has `title` + `description` | Custom domain / live `docs.fireweave.ai` still NEEDS VERIFICATION. Do not claim the site is live. |
| 027 | Navigation | DONE | 005, 006 | `docs.json` | Nav groups match IA §3; no starter Mintlify anchors | |
| 028 | Link validation | DONE | 007–025, 033 | all MDX | `scripts/validate-examples.mjs` + `mint broken-links --check-anchors --check-redirects` | Internal links PASS. Externals not exhaustively live-probed; do not invent URLs. |
| 029 | Code example validation | DONE | 008–025, 033 | all example blocks | `scripts/validate-examples.mjs` — 186 blocks, 0 errors | Static import/package checks vs SDK audit + `/tmp/fireweave-sdk`. Compile skipped (fragments). Report: `audits/example-validation.md`. |
| 030 | Mintlify validation | DONE | 006 | `docs.json`, MDX | `mint validate` PASS; `mint broken-links` PASS | Host Node 25 blocked mint; used Node 20.19.4. See `audits/mint-validation.md`. CI: `.github/workflows/docs-validate.yml`. |
| 031 | Documentation gap report | DONE | 002, 003, 004 | `DOCUMENTATION_GAPS.md` | Gap file current after pages + checkpoint 9 | Remaining items are CONFIRMED GAP / NEEDS VERIFICATION, not missing files. |
| 032 | Mintlify platform research | DONE | — | `audits/mintlify-platform.md` | Deliverable exists; informs 006 | Sibling audit complete. Config is `docs.json`; CLI package is `mint`. |

---

## Notes

- Work only in this repo (`FireWeave-HQ/docs.fireweave.ai`).
- Existing `README.md` is still a Mintlify/GitHub starter placeholder — do not replace it until an explicit task.
- No commit unless asked.
- `.gitignore` and `.github/workflows/docs-validate.yml` now exist. There is no `mint.json`.
- **Publish state (live 2026-08-17):** `@fireweaveai/sdk@2.1.0` (`latest` = 2.1.0), `@fireweaveai/web-sdk@2.1.0`, PyPI `fireweave==0.1.0`. Go unpublished (replace + checkout). Java unpublished (`mvn install` 0.1.0-SNAPSHOT). 2.0.0 vs 2.1.0 behavioral breakages still true (`./posthog` gone on 2.1).
- Source of truth for APIs remains SDK `master`, not a local feature branch.
- Do not claim `docs.fireweave.ai` is live. Mintlify dashboard / custom domain remain NEEDS VERIFICATION.
