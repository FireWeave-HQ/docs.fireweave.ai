# Documentation project instructions

Mintlify site for docs.fireweave.ai. Pages are MDX with YAML frontmatter; configuration is `docs.json`.

## Sources of truth

Write from the `main` branches only: `fireweaveai-platform` (start at `docs/kb/00-orient/what-is-fireweave.md`; terms in `docs/kb/generated/terms.md`) and `fireweave-sdk`. Check published versions on the registries. Never invent a command, flag, env var, UI label or API.

## Terminology

- The product is **Fireweave**: spell it that way in prose, titles and descriptions. Keep `FireWeave-HQ` in GitHub URLs, and quote verbatim, in `code`, any string the reader must match exactly, such as the check `FireWeave — rollout readiness` or CLI output.
- The thing a change ships behind is a **control point**, never a "flag".
- A customer's end user or device is a **target**; **user** means a Fireweave account. A **cohort** is a project's named group of targets. Never name the vendor behind Fireweave's control points (its persons, flags or condition sets).
- Retired words (MCP, safe rollout, deploy detection, OpenFeature, "Release Radar", and the rest of the KB glossary's "Retired words") appear only where a page says they are retired.
- Don't promise what isn't live: automatic revert, a required merge gate, coordinated rollouts, applying a cohort edit to a running step ("apply now", dynamic cohort edits; a re-pin that applies at the next step is live), exclude lists (no web app screen), and SDK methods for the targets batch, unset and delete routes.

## Style

- Short. One or two sentences, then a visual, then short sections. Tables and code over paragraphs.
- Second person, active voice, sentence-case headings, **bold** UI labels, `code` for commands and paths.
- Visuals use the house components in `/snippets/flow.jsx` (`Flow`, `Ramp`, `StateRail`), styled by `brand.css` from the design-system tokens. Never use Mermaid: it can't follow the brand or dark mode.
- Components take string props only, so Mintlify renders them on the server.

## Validate

```bash
npx mint validate
npx mint broken-links --check-anchors --check-redirects
```
