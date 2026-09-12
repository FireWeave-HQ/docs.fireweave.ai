# Mintlify foundation notes (task 006)

**Date:** 2026-08-17  
**Applies to:** `docs.json`, `.mintignore`, `.gitignore`, `.github/workflows/docs-validate.yml`, `README.md`  
**Does not claim:** `https://docs.fireweave.ai` is live.

This file records decisions and **manual** follow-up. It is ignored from the published site via `.mintignore`.

---

## What was applied in Git

- Site name: **Fireweave**
- Navigation: `navigation.groups` matching `audits/information-architecture.md` §3 (official single-product SDK pattern)
- Mintlify marketing navbar, footer, and anchors removed
- Verified GitHub SDK link only: `https://github.com/FireWeave-HQ/fireweave-sdk`
- Agent features that are documented keys: `description`, `markdown.instructions`, `contextual.options` (kept), `seo`, `search.prompt`, `metadata.timestamp`
- `llms.txt` / `llms-full.txt` / `skill.md` / public `/mcp` are **automatic** on a published Mintlify host — no extra `docs.json` keys
- No `redirects` (IA listed no confirmed old public URLs on this host)
- No `mint.json`
- Logo/favicon **paths** unchanged (`/logo/light.svg`, `/logo/dark.svg`, `/favicon.svg`). Artwork is still the Mintlify starter mark — no licensed Fireweave asset exists in this repo

---

## NEEDS VERIFICATION

1. **Brand colors.** `docs.json` still uses the starter hex values (`#16A34A`, `#07C983`, `#15803D`). These are **Mintlify leftover greens**, not documented Fireweave brand. No Fireweave palette was found in this repo or the sibling audits. Replace when a licensed brand spec exists.
2. **Logo / favicon artwork.** Starter Mintlify wordmarks remain. Do not invent a mark. Replace only from a licensed Fireweave source.
3. **Navbar primary / console URL.** IA asked for Fireweave app or GitHub. GitHub SDK is verified. `https://app.fireweave.ai` exists as the in-app host and is likely login-gated (`audits/existing-docs.md`). Not added as a “Dashboard” CTA until the customer-facing logged-out URL is confirmed.
4. **`seo.metatags.canonical`** is set to `https://docs.fireweave.ai` as the **intended** canonical (Mintlify custom-domain docs). DNS did **not** resolve at audit time. Do not treat this as proof the domain is live.
5. **`seo.organization.url`** is `https://fireweave.ai` (marketing site listed in existing-docs). Confirm this is the legal/canonical org homepage for JSON-LD.
6. **Mintlify plan.** Assistant, dashboard CI checks, Vale, and some contextual options are plan-gated. CLI `mint validate` / `mint broken-links` work on any plan.
7. **GitHub App + Git Settings.** Deploy-on-push requires the dashboard connection. Not visible from repo files.
8. **Node version in CI.** Workflow pins `20.17` (Mintlify CLI minimum). Confirm whether the org prefers Node 20 latest or 22.
9. **`navigation.groups` vs starter `navigation.pages` + nested group.** Official SDK pattern is `groups`. Confirm `mint validate` / preview render identically once sibling MDX pages exist.
10. **CNAME target.** Official docs say `cname.mintlify.builders`. Always copy the live dashboard records; do not hardcode from this note if the dashboard differs.
11. **Cloudflare.** If `docs.fireweave.ai` is already orange-cloud proxied, follow the Cloudflare-proxied flow (not TXT-first). Account details unknown.
12. **Search MCP.** Public `/mcp` is automatic after publish. Authenticated docs need a dashboard toggle.
13. **CI vs missing pages.** Sibling agents own IA MDX files. `mint validate` and `mint broken-links` will fail until those pages exist on disk. `index.mdx` and `quickstart.mdx` were left as starter placeholders.

---

## Manual actions (not done in Git)

### MINTLIFY (dashboard or authenticated CLI)

1. Open [Git Settings](https://app.mintlify.com/settings/deployment/git-settings). Connect `FireWeave-HQ/docs.fireweave.ai`, branch `main`, docs root = repository root.
2. Install the [Mintlify GitHub App](https://www.mintlify.com/docs/deploy/github) if it is not already installed.
3. Custom domain: [Custom domain setup](https://app.mintlify.com/settings/deployment/custom-domain) — enter `docs.fireweave.ai` (or `mint login` then `mint add-domain docs.fireweave.ai`).
4. Wait for verification **TXT** values. Add TXT records first. Do **not** change CNAME until both TXT records show verified, except Cloudflare-proxied hosts (see Mintlify custom-domain docs).
5. After DNS + TLS are green, confirm `seo.metatags.canonical` in `docs.json` still matches the live hostname.
6. Optional (Pro+): enable Assistant and dashboard CI checks (broken links / Vale) on [Add-ons](https://app.mintlify.com/products/addons).
7. Do **not** block reserved paths on any reverse proxy: `/mcp`, `/llms.txt`, `/llms-full.txt`, `/skill.md`, `/sitemap.xml`, `/robots.txt`, `/.well-known`.

### DNS (domain / Cloudflare)

Dashboard will show records of this form (copy **exact** values from the dashboard):

```text
TXT   | _acme-challenge.docs.fireweave.ai     | <dashboard value>
TXT   | _cf-custom-hostname.docs.fireweave.ai | <dashboard value>
CNAME | docs.fireweave.ai                     | cname.mintlify.builders
```

If Cloudflare is the provider:

- SSL/TLS: **Full (strict)**
- Disable **Always Use HTTPS** in Edge Certificates while Let’s Encrypt provisions
- If the hostname is already proxied, use the Cloudflare-proxied flow (gray-cloud CNAME first)
- If CAA records exist, allow Let’s Encrypt: `0 issue "letsencrypt.org"`
- Do not redirect `/.well-known/acme-challenge`

Propagation is typically 1–24 hours. HTTP first, then HTTPS after TLS.

In-app docs at `https://app.fireweave.ai/docs` are a **different host**. They do not redirect from this repo. Do not add Git redirects that pretend they do.

### GITHUB

1. Confirm the Mintlify GitHub App is installed on `FireWeave-HQ/docs.fireweave.ai`.
2. After the workflow file lands, confirm Actions can run (`mint validate` / `mint broken-links`). Expect failures until IA pages exist.
3. Branch protection / required checks are optional and not configured here.
4. Custom domain is **not** configured in Git.

---

## Files deleted

None. Repository audit listed no leftover starter pages (`essentials/`, `api-reference/`, `snippets/`, `development.mdx`). `index.mdx` and `quickstart.mdx` were left so the site still has placeholders while sibling agents rewrite them.
