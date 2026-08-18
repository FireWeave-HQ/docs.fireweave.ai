# TASK-032 — Mintlify platform research

**Researched:** 2026-08-17  
**Official index:** [https://www.mintlify.com/docs](https://www.mintlify.com/docs) · [https://www.mintlify.com/docs/llms.txt](https://www.mintlify.com/docs/llms.txt)  
**Target site:** https://docs.fireweave.ai  
**Repo:** https://github.com/FireWeave-HQ/docs.fireweave.ai  

This audit records **current** Mintlify conventions from official docs. It does **not** apply a new config, write product pages, or replace the existing starter `docs.json`.

---

## Executive summary

| Topic | Current answer | Official source |
| --- | --- | --- |
| Config filename | **`docs.json`** at the docs root. `mint.json` is **deprecated**. | [Global settings](https://www.mintlify.com/docs/organize/settings) |
| Schema | `"$schema": "https://mintlify.com/docs.json"` | [Global settings](https://www.mintlify.com/docs/organize/settings) |
| Required fields | `name`, `theme`, `colors.primary`, `navigation` | [Global settings](https://www.mintlify.com/docs/organize/settings) · [schema reference](https://www.mintlify.com/docs/organize/settings-reference) |
| Local preview | `mint dev` (package: `mint`, not `mintlify`) | [CLI install](https://www.mintlify.com/docs/cli/install) · [Preview](https://www.mintlify.com/docs/cli/preview) |
| Validation | `mint validate` + `mint broken-links` | [CLI commands](https://www.mintlify.com/docs/cli/commands) |
| Official CI | Dashboard **CI checks** (Pro/Enterprise) via GitHub App. No official marketplace Action found. | [CI checks](https://www.mintlify.com/docs/deploy/ci) · [GitHub](https://www.mintlify.com/docs/deploy/github) |
| Custom domain | Add in **Mintlify dashboard** (or `mint add-domain`); customer adds **DNS TXT then CNAME** | [Custom domain](https://www.mintlify.com/docs/customize/custom-domain) |
| Pages | `.mdx` preferred; `.md` allowed | [Pages](https://www.mintlify.com/docs/organize/pages) |

**This repo already has a valid starter `docs.json`.** There is **no** `mint.json`. Do not invent a second config file. Replace starter branding later; do not apply the skeleton below yet.

---

## 1. Configuration format

**Filename:** `docs.json` at the root of the documentation directory.  
**Source:** [https://www.mintlify.com/docs/organize/settings](https://www.mintlify.com/docs/organize/settings)

Required to build a working site:

| Field | Meaning |
| --- | --- |
| `name` | Project / org name |
| `theme` | Layout theme |
| `colors.primary` | Hex brand color |
| `navigation` | Content structure |

Optional but recommended: `$schema` for editor autocomplete/validation.

Large configs can be split with `$ref` to relative JSON files inside the project root. Path traversal is rejected. Circular refs fail the build.  
**Source:** [Global settings — `$ref`](https://www.mintlify.com/docs/organize/settings)

### Upgrade from `mint.json`

If a project still has `mint.json`, official upgrade path is:

1. `npm i -g mint` (or `mint update`)
2. `mint dev` — generates `docs.json` from `mint.json`
3. Review, then delete `mint.json`

**Source:** [Upgrade from mint.json](https://www.mintlify.com/docs/organize/settings#upgrade-from-mintjson)

This repo has **no** `mint.json`. Skip the upgrade path.

### Minimal example skeleton

> **EXAMPLE ONLY — not applied to this repo.** Copied/adapted from the official minimal configuration.

```json
{
  "$schema": "https://mintlify.com/docs.json",
  "theme": "mint",
  "name": "Your project name",
  "colors": {
    "primary": "#ff0000"
  },
  "navigation": {
    "groups": [
      {
        "group": "Home",
        "pages": ["index"]
      }
    ]
  }
}
```

**Source:** [Minimal configuration](https://www.mintlify.com/docs/organize/settings#minimal-configuration)

Complete property list: [docs.json schema reference](https://www.mintlify.com/docs/organize/settings-reference).

---

## 2. Navigation schema

**Source:** [Navigation](https://www.mintlify.com/docs/organize/navigation) · [Site structure](https://www.mintlify.com/docs/organize/settings-structure)

Choose **one primary pattern** at the root of `navigation`, then nest other elements inside it.

| Pattern | Use when | Official example |
| --- | --- | --- |
| `groups` | One linear sidebar (single-product SDK) | A single-product SDK reference |
| `tabs` | Parallel sections, same audience | Guides, API reference, and SDKs |
| `anchors` | Persistent top-level destinations | Community, status, external links |
| `dropdowns` | Tab-like, but a dropdown | Product docs vs API vs partners |
| `products` | Multiple distinct products, one deployment | Payments / Identity / Analytics |
| `versions` | Parallel versions | `v1` and `v2` |
| `languages` | Localized docs | en / es / ja |

### Pages

`navigation.pages` is an array. Each entry is a path to a page file (no extension), relative to the docs root.

```json
{
  "navigation": {
    "pages": ["settings", "pages", "navigation"]
  }
}
```

**Source:** [Pages](https://www.mintlify.com/docs/organize/navigation#pages)

### Groups

`navigation.groups` is an array. Each object requires `group` + `pages`. Optional: `icon`, `tag`, `root`, `expanded`. Groups nest. `pages` entries may be page paths **or** nested group objects.

```json
{
  "navigation": {
    "groups": [
      {
        "group": "Getting started",
        "icon": "play",
        "pages": [
          "quickstart",
          {
            "group": "Editing",
            "expanded": false,
            "icon": "pencil",
            "pages": ["installation", "editor"]
          }
        ]
      }
    ]
  }
}
```

**Source:** [Groups](https://www.mintlify.com/docs/organize/navigation#groups)

`root` makes the group title open a landing page. `directory` (`none` | `accordion` | `card`) can auto-list children on that root page. `expanded` only affects **nested** groups.

### Tabs (recommended for a developer SDK site)

```json
{
  "navigation": {
    "tabs": [
      {
        "tab": "API reference",
        "icon": "square-terminal",
        "pages": ["api-reference/get", "api-reference/post"]
      },
      {
        "tab": "SDKs",
        "icon": "code",
        "pages": ["sdk/fetch", "sdk/create"]
      },
      {
        "tab": "Blog",
        "icon": "newspaper",
        "href": "https://external-link.com/blog"
      }
    ]
  }
}
```

Tabs can contain `menu` (dropdown columns), groups, pages, or `openapi` (see API section).  
**Source:** [Tabs](https://www.mintlify.com/docs/organize/navigation#tabs)

### Other navigation keys

- `anchors` / `navigation.global.anchors` — persistent sidebar or global links. [Anchors](https://www.mintlify.com/docs/organize/navigation#anchors)
- `navbar.links`, `navbar.primary` — top bar. [Site structure](https://www.mintlify.com/docs/organize/settings-structure)
- `footer.socials`, `footer.links` — footer. [Site structure](https://www.mintlify.com/docs/organize/settings-structure)
- `banner` — site-wide announcement. [Site structure](https://www.mintlify.com/docs/organize/settings-structure)

**Do not** use the old `mint.json` pattern of separate top-level `tabs` / `anchors` / `versions` arrays mapped onto `navigation`. Those were merged into one recursive `navigation` object.  
**Source:** [Refactoring mint.json into docs.json](https://www.mintlify.com/blog/refactoring-mint-json-into-docs-json)

---

## 3. Recommended local workflow

**Sources:** [Install the CLI](https://www.mintlify.com/docs/cli/install) · [Preview locally](https://www.mintlify.com/docs/cli/preview) · [CLI commands](https://www.mintlify.com/docs/cli/commands) · [Quickstart](https://www.mintlify.com/docs/quickstart)

1. Node.js **v20.17.0+** (LTS recommended).
2. Install the current CLI package **`mint`**:

   ```bash
   npm i -g mint
   # or: pnpm add -g mint
   ```

3. If both `mint` and the old `mintlify` package are installed, uninstall `mintlify`:

   ```bash
   npm uninstall -g mintlify
   npm cache clean --force
   npm i -g mint
   ```

   **Source:** [CLI install troubleshooting](https://www.mintlify.com/docs/cli/install)

4. From the directory that contains `docs.json`:

   ```bash
   mint dev
   ```

   Preview: `http://localhost:3000`. Flags: `--port`, `--no-open`, `--disable-openapi`, `--disable-prefetch`, `--groups`, `--local-schema`.

5. Optional: `mint login` to enable **search** and the **assistant** in local preview. Credentials: `~/.config/mintlify/config.json`.
6. Before considering a change done: `mint validate` and `mint broken-links`.
7. Keep the CLI current: `mint update` (or `npm i -g mint@latest`).

`npx mint dev` also works without a global install.  
**Source:** [Preview locally](https://www.mintlify.com/docs/cli/preview)

`mintlify dev` is **not** the current command. The npm package is `mint`.

---

## 4. Validation and CI

### CLI (works on any plan)

| Command | Purpose | Source |
| --- | --- | --- |
| `mint validate` | Strict build validation, including OpenAPI referenced in `docs.json` | [CLI commands](https://www.mintlify.com/docs/cli/commands) |
| `mint broken-links` | Internal links in `.md` / `.mdx` | [CLI commands](https://www.mintlify.com/docs/cli/commands) |
| `mint a11y` | Contrast + missing alt text | [CLI commands](https://www.mintlify.com/docs/cli/commands) |
| `mint format` | Canonical MDX formatting (rewrites in place) | [CLI commands](https://www.mintlify.com/docs/cli/commands) |

`mint broken-links` flags:

- `--check-anchors` — heading slugs
- `--check-external` — external URLs
- `--check-redirects` — `docs.json` redirect destinations
- `--check-snippets` — links inside snippet components
- `--files` — limit to paths/globs

Does **not** check links inside OpenAPI files. Links to `.mintignore`d files report as broken.  
**Source:** [mint broken-links](https://www.mintlify.com/docs/cli/commands)

`mint openapi-check` is **deprecated**. Use `mint validate`.  
**Source:** [mint validate](https://www.mintlify.com/docs/cli/commands)

### Official Mintlify CI (dashboard, Pro/Enterprise)

Mintlify can run checks on PRs against the configured deployment branch after the [GitHub App](https://www.mintlify.com/docs/deploy/github) is installed. Enable checks on [Add-ons](https://app.mintlify.com/products/addons) as `Warning` or `Blocking`.

Available official check documented: **broken links** (internal only, same idea as the CLI). Vale prose linting is also documented.  
**Source:** [CI checks](https://www.mintlify.com/docs/deploy/ci)

### Recommended GitHub Actions (CLI, plan-independent)

Official docs describe dashboard CI, **not** a published `mintlify/action` GitHub Action. Research on 2026-08-17 found no official marketplace Action. Recommend a workflow that installs `mint` and runs the official CLI.

> **EXAMPLE ONLY — not added to this repo.** Commands are from official CLI docs; the workflow wrapper is a recommendation.

```yaml
# .github/workflows/docs-validate.yml
name: Docs validate
on:
  pull_request:
  push:
    branches: [main]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - name: Install Mintlify CLI
        run: npm i -g mint
      - name: Validate build (incl. OpenAPI)
        run: mint validate
      - name: Check links
        run: mint broken-links --check-anchors --check-redirects
```

**NEEDS VERIFICATION:** Confirm Node 20 vs 22 in CI; whether `mint validate` needs network for remote OpenAPI; whether the org has Pro/Enterprise so dashboard CI can replace or complement this workflow.

---

## 5. Custom domain

**Source:** [Custom domain](https://www.mintlify.com/docs/customize/custom-domain)

Hosting options: apex (`example.com`), subdomain (`docs.example.com`), or subpath (`example.com/docs`). Subpath + authentication is **not** supported.

### Who does what

#### MINTLIFY ACTIONS (dashboard or authenticated CLI)

1. Open [Custom domain setup](https://app.mintlify.com/settings/deployment/custom-domain).
2. Optionally enable **Host at** and set a base path (e.g. `/docs`).
3. Enter hostname (`docs.fireweave.ai`) and **Add domain**.
4. Or: `mint login` then `mint add-domain docs.fireweave.ai` ([CLI](https://www.mintlify.com/docs/cli/commands#mint-add-domain)).
5. Wait for dashboard to show verification TXT + CNAME values.
6. Add TXT records first. **Do not** change CNAME until both TXT records show verified (green check), except Cloudflare-proxied hosts (see pitfalls).
7. After DNS + TLS, set a canonical URL in `docs.json` (GitHub content change):

```json
"seo": {
  "metatags": {
    "canonical": "https://docs.fireweave.ai"
  }
}
```

**Source:** [Set a canonical URL](https://www.mintlify.com/docs/customize/custom-domain#set-a-canonical-url)

#### DNS ACTIONS (domain / Cloudflare)

Dashboard shows records of this form:

```text
TXT   | _acme-challenge.<your-domain>     | <dashboard value>
TXT   | _cf-custom-hostname.<your-domain> | <dashboard value>
CNAME | <your-domain>                     | cname.mintlify.builders
```

**Source:** [Configure your DNS](https://www.mintlify.com/docs/customize/custom-domain#configure-your-dns)

If Cloudflare is the DNS provider:

- SSL/TLS: **Full (strict)**
- Disable **Always Use HTTPS** in Edge Certificates (blocks Let’s Encrypt during provisioning)
- If the hostname is already orange-cloud proxied, TXT pre-validation will not show verified until CNAME points at Mintlify. For zero downtime, set CNAME to **DNS only** (gray cloud) first.

**Source:** [Cloudflare-proxied domains](https://www.mintlify.com/docs/customize/custom-domain#cloudflare-proxied-domains) · [Provider-specific settings](https://www.mintlify.com/docs/customize/custom-domain#provider-specific-settings)

If the domain has CAA records, allow Let’s Encrypt: `0 issue "letsencrypt.org"`.

Do not redirect `/.well-known/acme-challenge`.

Propagation: typically 1–24 hours (up to 48). HTTP first, then HTTPS after TLS.

#### GITHUB ACTIONS

Custom domain is **not** configured in Git. After the domain is live, commit `seo.metatags.canonical` (and later Fireweave branding) in `docs.json`. The GitHub App deploys that commit.  
**Source:** [GitHub](https://www.mintlify.com/docs/deploy/github)

Reserved paths that cannot be used as a base path include `/mcp`, `/llms.txt`, `/llms-full.txt`, `/sitemap.xml`, `/robots.txt`, `/skill.md`, `/.well-known`, and others.  
**Source:** [Base path requirements](https://www.mintlify.com/docs/customize/custom-domain#base-path-requirements)

---

## 6. Redirects

**Source:** [Redirects](https://www.mintlify.com/docs/create/redirects)

Add a top-level `redirects` array in `docs.json`:

```json
{
  "redirects": [
    {
      "source": "/source/path",
      "destination": "/destination/path"
    }
  ]
}
```

- Default: **308** permanent. `"permanent": false` → **307**.
- Sources cannot include `#anchors` or `?query`. Destinations may include anchors.
- Wildcards: `/beta/:slug*` → `/v2/:slug*`. Partial: `/articles/concepts-*`.
- Applied at request time on Mintlify hosting; preview deploys apply them; `mint dev` applies them locally.
- Validate destinations: `mint broken-links --check-redirects`.

Avoid circular pairs. No hard cap, but thousands of entries can slow deploys — prefer wildcards.

---

## 7. API documentation

**Sources:** [API settings](https://www.mintlify.com/docs/organize/settings-api) · [OpenAPI setup](https://www.mintlify.com/docs/api-playground/openapi-setup) · [MDX API pages](https://www.mintlify.com/docs/api-playground/mdx-setup) · [SDK reference](https://www.mintlify.com/docs/api-playground/sdk-reference-setup)

| Method | How |
| --- | --- |
| OpenAPI 3.0 / 3.1 | File, URL, array, or `{ "source", "directory" }` in `api.openapi` **or** `openapi` on a navigation tab/group |
| AsyncAPI | `api.asyncapi` |
| GraphQL | Separate setup: [GraphQL](https://www.mintlify.com/docs/api-playground/graphql-setup) |
| Manual MDX | Frontmatter `api` / `openapi: "GET /endpoint"` |
| SDK reference | `sdk` navigation from TypeDoc, DocFX, Javadoc, Sphinx, phpDocumentor |

OpenAPI in navigation (official pattern for an API tab):

```json
"navigation": {
  "tabs": [
    {
      "tab": "API Reference",
      "openapi": "openapi.json"
    }
  ]
}
```

**Source:** [OpenAPI setup](https://www.mintlify.com/docs/api-playground/openapi-setup)

Playground: `api.playground.display` = `interactive` | `simple` | `none` | `auth`. Default `interactive`. Proxy default `true`.  
`$ref` in OpenAPI: **internal only** (no external refs).  
Validate with `mint validate`, not `mint openapi-check`.

---

## 8. SEO

**Sources:** [SEO](https://www.mintlify.com/docs/optimize/seo) · [SEO and search settings](https://www.mintlify.com/docs/organize/settings-seo)

Mintlify auto-generates:

- Meta tags (`title`, `description`, `og:*`, `twitter:*`, `canonical`, `robots`)
- JSON-LD (`Organization`, `WebSite`, `WebPage`, `BreadcrumbList`, `TechArticle` or `APIReference`)
- Sitemap and `robots.txt`
- OG images (1200×630) from logo + title + description + primary color

Configure in `docs.json`:

- `description` — site blurb for SEO and AI
- `seo.indexing` — `navigable` (default) or `all`
- `seo.metatags` — global overrides (`canonical`, `og:image`, `google-site-verification`, …)
- `seo.organization` — structured-data publisher
- `search.prompt` — in-product search placeholder
- `metadata.timestamp` — last-modified from Git
- `thumbnails.background` — custom OG background while keeping auto overlay

Per-page: frontmatter `title`, `description`, `canonical`, `"og:image"`, `keywords`, `noindex`, `hidden`.  
**Source:** [Pages](https://www.mintlify.com/docs/organize/pages)

---

## 9. Agent-friendly features to enable

| Feature | What it is | How it is enabled | Source |
| --- | --- | --- | --- |
| `llms.txt` / `llms-full.txt` | Page index + full-site dump for LLMs | **Automatic** at `/llms.txt`, `/llms-full.txt`, and `/.well-known/…`. Optional root override. | [llms.txt](https://www.mintlify.com/docs/ai/llmstxt) |
| Markdown export | `.md` URL suffix or `Accept: text/markdown` | **Automatic** | [Markdown export](https://www.mintlify.com/docs/ai/markdown-export) |
| `skill.md` | Agent capability summary | **Automatic** (can take up to 24h). Optional root `skill.md` or `.mintlify/skills/*/SKILL.md` | [skill.md](https://www.mintlify.com/docs/ai/skillmd) |
| Search MCP | Read-only tools: Search, Query docs filesystem, Submit feedback | Hosted at `https://<docs-host>/mcp`. Public sites: available. Auth sites: enable in dashboard **Settings → Security & access → MCP**; authed path `/authed/mcp` | [Search MCP](https://www.mintlify.com/docs/ai/model-context-protocol) |
| Admin MCP | Write access: edit pages, `docs.json`, open PRs | `https://mcp.mintlify.com` + OAuth. Trusted tools only. | [Admin MCP](https://www.mintlify.com/docs/ai/mintlify-mcp) |
| Contextual menu | Copy/view Markdown, ChatGPT/Claude/Cursor/VS Code/MCP | `contextual.options` in `docs.json` | [Contextual menu](https://www.mintlify.com/docs/ai/contextual-menu) |
| Assistant (“Ask AI”) | In-site chat with citations | **Dashboard**, Pro+. Optional page `mode: "assistant"`. Customize with `Assistant.md` | [Assistant](https://www.mintlify.com/docs/assistant) · [Pages — assistant mode](https://www.mintlify.com/docs/organize/pages) |
| `markdown.instructions` | Site-wide agent instructions in Markdown + llms.txt | `docs.json` | [Markdown export](https://www.mintlify.com/docs/ai/markdown-export) |
| `Visibility` | Human vs agent content on one page | MDX `<Visibility for="humans\|agents">` | [Visibility](https://www.mintlify.com/docs/components/visibility) |
| `mint score` | Agent-readiness score vs a live URL | CLI, requires `mint login` | [mint score](https://www.mintlify.com/docs/cli/commands) |
| Mintlify Index | Cross-site docs search for coding agents | `mint index --cursor` etc. | [CLI — mint index](https://www.mintlify.com/docs/cli/commands) |

**Recommend enabling for Fireweave SDK docs (when implementing, not now):**

1. Keep auto `llms.txt` / `llms-full.txt` / `skill.md` (do not block `/mcp`, `/llms.txt`, `/skill.md` on a reverse proxy).
2. Keep/expand `contextual.options` (`copy`, `view`, `mcp`, `cursor`, `vscode`, plus chat tools).
3. Add `description` + `markdown.instructions` in `docs.json`.
4. Write page `description` frontmatter (feeds `llms.txt`).
5. Enable assistant in the dashboard if the plan includes it.
6. After go-live, run `mint score https://docs.fireweave.ai`.

---

## 10. Components for a developer SDK docs site

**Index:** [Components overview](https://www.mintlify.com/docs/components)

| Component | Use for SDK docs | Official page |
| --- | --- | --- |
| `Steps` / `Step` | Install, auth, first request | [Steps](https://www.mintlify.com/docs/components/steps) |
| `Tabs` / `Tab` | Language or platform variants (syncs with CodeGroup) | [Tabs](https://www.mintlify.com/docs/components/tabs) |
| `CodeGroup` | Multi-language snippets (`javascript` / `python` / `go` …) | [Code groups](https://www.mintlify.com/docs/components/code-groups) |
| `Card` + `Columns` | Homepage / section landing links | [Cards](https://www.mintlify.com/docs/components/cards) |
| `Note` `Info` `Tip` `Warning` `Check` `Danger` | Prerequisites, breaking changes, security | [Callouts](https://www.mintlify.com/docs/components/callouts) |
| `Accordion` / `AccordionGroup` | FAQ, error catalogs | [Accordions](https://www.mintlify.com/docs/components/accordions) |
| `ParamField` / `ResponseField` / `Expandable` | Manual API fields | [Fields](https://www.mintlify.com/docs/components/fields) |
| `RequestExample` / `ResponseExample` | Side-by-side samples | [Examples](https://www.mintlify.com/docs/components/examples) |
| `Tree` | Repo / package layout | [Tree](https://www.mintlify.com/docs/components/tree) |
| `Mermaid` | Auth and request-flow diagrams | [Mermaid](https://www.mintlify.com/docs/components/mermaid-diagrams) |
| `Prompt` | Copy-to-Cursor agent prompts | [Prompt](https://www.mintlify.com/docs/components/prompt) |
| `Visibility` | UI copy vs agent/API copy | [Visibility](https://www.mintlify.com/docs/components/visibility) |
| `Update` | Changelog | [Update](https://www.mintlify.com/docs/components/update) |

Also available: Badge, Banner, Color, Frames, GitHub embed, Icons, Panel, Tiles, Tooltips, View.

---

## 11. Theme, colors, logo, favicon

**Sources:** [Appearance](https://www.mintlify.com/docs/organize/settings-appearance) · [Themes](https://www.mintlify.com/docs/customize/themes)

- **Themes:** `mint`, `maple`, `palm`, `willow`, `linden`, `almond`, `aspen`, `sequoia`, `luma`. Required.
- **Colors:** `primary` required (hex). Optional `light`, `dark`.
- **Logo:** string path or `{ light, dark, href }`.
- **Favicon:** string or `{ light, dark }`. Auto-resized.
- **Appearance:** `default` `system` | `light` | `dark`; `strict` hides the toggle.
- **Fonts:** Google Fonts by family name, or self-hosted `source` + `format`.
- **Icons library:** `fontawesome` (default) | `lucide` | `tabler` — one library per site.
- **Thumbnails:** OG/social preview theme and background.

---

## 12. MDX vs MD

**Source:** [Pages](https://www.mintlify.com/docs/organize/pages)

- Both `.mdx` and `.md` are valid pages.
- **Prefer MDX** for components (Steps, Tabs, Cards, playground).
- `.md` is for migration speed only.
- Frontmatter is optional; omitted `title` is derived from the path.
- Page modes: default, `wide`, `custom`, `frame` (some themes), `center` (some themes), `assistant`.

---

## 13. Required files for a valid project

**Minimum (official):**

1. `docs.json` with `name`, `theme`, `colors.primary`, `navigation`
2. At least one page file referenced by navigation (typically `index.mdx`)

**Source:** [Global settings](https://www.mintlify.com/docs/organize/settings) · [Pages](https://www.mintlify.com/docs/organize/pages) · [Preview prerequisites](https://www.mintlify.com/docs/cli/preview)

**Strongly recommended:**

| File | Role |
| --- | --- |
| `logo/light.svg` + `logo/dark.svg` | Branding |
| `favicon.svg` | Favicon |
| `.mintignore` | Exclude drafts; default ignores already include `.git`, `.github`, `README.md`, `LICENSE.md`, etc. [mintignore](https://www.mintlify.com/docs/organize/mintignore) |
| `AGENTS.md` | Mintlify agent conventions [Customize agent](https://www.mintlify.com/docs/agent/customize) |

**Not required in Git:** custom domain, GitHub App, assistant toggle, dashboard CI add-ons.

`mint new` scaffolds a starter from [mintlify/templates](https://github.com/mintlify/templates).  
**Source:** [CLI install — Create a new project](https://www.mintlify.com/docs/cli/install)

---

## 14. GitHub vs Mintlify dashboard vs DNS

| Concern | Where it lives | Source |
| --- | --- | --- |
| Page content, `docs.json`, redirects, logos, OpenAPI, `.mintignore` | **GitHub** | [Concepts](https://www.mintlify.com/docs/reference/concepts) |
| Connect repo, branch, subdirectory | **Dashboard → Git Settings** + GitHub App | [GitHub](https://www.mintlify.com/docs/deploy/github) |
| Production deploy on push to configured branch | **GitHub App** (automatic) | [GitHub](https://www.mintlify.com/docs/deploy/github) · [Quickstart](https://www.mintlify.com/docs/quickstart) |
| PR preview URLs | **GitHub App** / dashboard | [Preview deployments](https://www.mintlify.com/docs/deploy/preview-deployments) |
| In-product search index | **Automatic** on publish; `search.prompt` in Git | [SEO and search](https://www.mintlify.com/docs/organize/settings-seo) · [Search ranking](https://www.mintlify.com/docs/optimize/search) |
| Assistant on/off, credits, starter questions | **Dashboard** (Pro+) | [Configure assistant](https://www.mintlify.com/docs/assistant/configure) |
| Official PR CI checks (broken links, Vale) | **Dashboard Add-ons** (Pro/Enterprise) | [CI checks](https://www.mintlify.com/docs/deploy/ci) |
| Custom domain registration | **Dashboard** or `mint add-domain` | [Custom domain](https://www.mintlify.com/docs/customize/custom-domain) |
| DNS TXT / CNAME | **DNS provider** | [Custom domain](https://www.mintlify.com/docs/customize/custom-domain) |
| Canonical URL, branding, contextual menu | **`docs.json` in Git** | [SEO](https://www.mintlify.com/docs/optimize/seo) |
| Search MCP for public docs | **Automatic** at `/mcp` | [Search MCP](https://www.mintlify.com/docs/ai/model-context-protocol) |
| Search MCP for authenticated docs | **Dashboard → Security & access → MCP** | [Search MCP](https://www.mintlify.com/docs/ai/model-context-protocol) |

---

## Existing repo — conflicts and leftovers

Inspected 2026-08-17. This is a **Mintlify starter**, not a Fireweave-branded site.

| Path | Status vs current Mintlify | Conflict / action later |
| --- | --- | --- |
| `docs.json` | **Present.** Current format + `$schema`. | Starter name, Mintlify green, Mintlify navbar/footer/anchors. **Do not add `mint.json`.** Navigation uses `pages: [ { group, pages } ]` instead of official `groups: […]` — both appear valid (groups nest inside `pages`), but official “single-product SDK” pattern is `navigation.groups`. **NEEDS VERIFICATION** which form we standardize on. |
| `mint.json` | Absent | Correct. Do not create. |
| `index.mdx`, `quickstart.mdx` | Valid MDX + frontmatter + starter components | Placeholder copy. Do not treat as product docs. |
| `logo/light.svg`, `logo/dark.svg`, `favicon.svg` | Present | Starter assets; replace with Fireweave brand later. |
| `.mintignore` | Present; matches official draft examples | Keep. |
| `AGENTS.md` | Starter template | Mentions admin MCP + Mintlify docs MCP correctly. Still says “customize this file”. |
| `README.md` | Starter kit README | Dashboard URL `dashboard.mintlify.com` may be stale vs current `app.mintlify.com`. **NEEDS VERIFICATION.** |
| `LICENSE` | MIT, copyright Mintlify 2026 | Starter license; decide Fireweave license later. |
| `.github/` | Absent | No validation workflow yet. |
| OpenAPI / `api` key | Absent | Add when API reference is implemented. |
| `redirects` | Absent | Add when slugs change. |
| `seo` / `description` / `canonical` | Absent | Add with custom domain. |

`docs.json` already enables a useful contextual menu (`copy`, `view`, `chatgpt`, `claude`, `perplexity`, `mcp`, `cursor`, `vscode`). Keep that pattern when rebranding.

---

## Pitfalls / outdated patterns to avoid

| Outdated or risky | Current replacement | Source |
| --- | --- | --- |
| `mint.json` | `docs.json` | [Upgrade](https://www.mintlify.com/docs/organize/settings#upgrade-from-mintjson) |
| Separate top-level `tabs` / `anchors` / `versions` in `mint.json` | Recursive `navigation` | [Blog: refactor](https://www.mintlify.com/blog/refactoring-mint-json-into-docs-json) |
| npm package / command `mintlify` | Package and CLI `mint` | [CLI install](https://www.mintlify.com/docs/cli/install) |
| `mint openapi-check` | `mint validate` | [CLI commands](https://www.mintlify.com/docs/cli/commands) |
| Inventing config keys | Only keys in [schema reference](https://www.mintlify.com/docs/organize/settings-reference) | Schema reference |
| CNAME before TXT verification | TXT first, then CNAME (except CF-proxied) | [Custom domain](https://www.mintlify.com/docs/customize/custom-domain) |
| Older CNAME targets (`cname.mintlify-dns.com` appears on stale mirrors) | Current docs: `cname.mintlify.builders` | [Custom domain](https://www.mintlify.com/docs/customize/custom-domain) |
| `CardGroup` as the grouping primitive | Official cards page now points to **`Columns`** | [Cards](https://www.mintlify.com/docs/components/cards) |
| Blocking `/mcp`, `/llms.txt`, `/skill.md` on a proxy | Reserved / required agent paths | [Custom domain reserved paths](https://www.mintlify.com/docs/customize/custom-domain) · [skill.md](https://www.mintlify.com/docs/ai/skillmd) |
| Assuming dashboard CI exists on every plan | Pro/Enterprise | [CI checks](https://www.mintlify.com/docs/deploy/ci) |
| Assuming assistant is free / in `docs.json` only | Dashboard + Pro credits | [Assistant](https://www.mintlify.com/docs/assistant) |
| External `$ref` in OpenAPI | Internal refs only | [OpenAPI setup](https://www.mintlify.com/docs/api-playground/openapi-setup) |
| Writing a second config file beside the existing `docs.json` | Edit the existing file later | This repo |

---

## NEEDS VERIFICATION

1. **Official GitHub Action.** No `mintlify/action` (or equivalent) is documented on mintlify.com as of this research. Confirm before depending on a third-party Action. Use `mint validate` / `mint broken-links` in a workflow, and/or dashboard CI if the plan includes it.
2. **Plan entitlements.** Assistant, dashboard CI, Vale, PDF download, and some contextual options are plan-gated. Confirm Fireweave’s Mintlify plan.
3. **GitHub App already installed?** Deploy-on-push only works after [Git Settings](https://app.mintlify.com/settings/deployment/git-settings) + App install. Not visible from repo files alone.
4. **`navigation.pages` + nested groups vs `navigation.groups`.** Starter uses the former; official “SDK reference” guidance uses `groups`. Confirm both render identically on current `mint` before rewriting.
5. **CNAME target.** Docs say `cname.mintlify.builders`. Always copy the exact records from the live dashboard; do not hardcode from this audit if the dashboard differs.
6. **Dashboard hostname.** Official docs use `app.mintlify.com`. Starter README still links `dashboard.mintlify.com`. Confirm which URL the org actually uses.
7. **Search MCP on a not-yet-public site.** Public `/mcp` is automatic; authenticated sites need a dashboard toggle. Confirm once the deployment exists.
8. **`skill.md` generation delay.** Officially up to 24 hours after publish. Do not treat a missing `/skill.md` on day one as a misconfig.
9. **Cloudflare account details.** If `docs.fireweave.ai` is already proxied, follow the Cloudflare-proxied flow, not the TXT-first flow.
10. **Whether a Mintlify deployment / subdomain already exists** for this GitHub repo. CLI `mint status` after `mint login` is the check; not done in this research task.

---

## Sources (official)

- [https://www.mintlify.com/docs](https://www.mintlify.com/docs)
- [https://www.mintlify.com/docs/llms.txt](https://www.mintlify.com/docs/llms.txt)
- [https://www.mintlify.com/docs/organize/settings](https://www.mintlify.com/docs/organize/settings)
- [https://www.mintlify.com/docs/organize/settings-reference](https://www.mintlify.com/docs/organize/settings-reference)
- [https://www.mintlify.com/docs/organize/settings-structure](https://www.mintlify.com/docs/organize/settings-structure)
- [https://www.mintlify.com/docs/organize/settings-appearance](https://www.mintlify.com/docs/organize/settings-appearance)
- [https://www.mintlify.com/docs/organize/settings-api](https://www.mintlify.com/docs/organize/settings-api)
- [https://www.mintlify.com/docs/organize/settings-seo](https://www.mintlify.com/docs/organize/settings-seo)
- [https://www.mintlify.com/docs/organize/navigation](https://www.mintlify.com/docs/organize/navigation)
- [https://www.mintlify.com/docs/organize/pages](https://www.mintlify.com/docs/organize/pages)
- [https://www.mintlify.com/docs/organize/mintignore](https://www.mintlify.com/docs/organize/mintignore)
- [https://www.mintlify.com/docs/cli/install](https://www.mintlify.com/docs/cli/install)
- [https://www.mintlify.com/docs/cli/preview](https://www.mintlify.com/docs/cli/preview)
- [https://www.mintlify.com/docs/cli/commands](https://www.mintlify.com/docs/cli/commands)
- [https://www.mintlify.com/docs/quickstart](https://www.mintlify.com/docs/quickstart)
- [https://www.mintlify.com/docs/deploy/ci](https://www.mintlify.com/docs/deploy/ci)
- [https://www.mintlify.com/docs/deploy/github](https://www.mintlify.com/docs/deploy/github)
- [https://www.mintlify.com/docs/customize/custom-domain](https://www.mintlify.com/docs/customize/custom-domain)
- [https://www.mintlify.com/docs/customize/themes](https://www.mintlify.com/docs/customize/themes)
- [https://www.mintlify.com/docs/create/redirects](https://www.mintlify.com/docs/create/redirects)
- [https://www.mintlify.com/docs/optimize/seo](https://www.mintlify.com/docs/optimize/seo)
- [https://www.mintlify.com/docs/api-playground/openapi-setup](https://www.mintlify.com/docs/api-playground/openapi-setup)
- [https://www.mintlify.com/docs/ai/llmstxt](https://www.mintlify.com/docs/ai/llmstxt)
- [https://www.mintlify.com/docs/ai/skillmd](https://www.mintlify.com/docs/ai/skillmd)
- [https://www.mintlify.com/docs/ai/model-context-protocol](https://www.mintlify.com/docs/ai/model-context-protocol)
- [https://www.mintlify.com/docs/ai/mintlify-mcp](https://www.mintlify.com/docs/ai/mintlify-mcp)
- [https://www.mintlify.com/docs/ai/contextual-menu](https://www.mintlify.com/docs/ai/contextual-menu)
- [https://www.mintlify.com/docs/ai/markdown-export](https://www.mintlify.com/docs/ai/markdown-export)
- [https://www.mintlify.com/docs/assistant](https://www.mintlify.com/docs/assistant)
- [https://www.mintlify.com/docs/components](https://www.mintlify.com/docs/components)
- [https://www.mintlify.com/blog/refactoring-mint-json-into-docs-json](https://www.mintlify.com/blog/refactoring-mint-json-into-docs-json)
