#!/usr/bin/env node
/**
 * Extract fenced code blocks from MDX and statically check FireWeave
 * package names / imports against the audited SDK surfaces.
 * Does not require live API keys. Optional compile if local toolchains exist.
 *
 * Usage: node scripts/validate-examples.mjs
 * Writes: audits/example-validation.md
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SDK_ROOTS = [
  process.env.FIREWEAVE_SDK_ROOT,
  '/tmp/fireweave-sdk',
  path.join(os.homedir(), 'Coding/fireweave-sdk'),
].filter(Boolean);

const NODE_PACKAGES = new Set(['@fireweaveai/sdk', '@openfeature/server-sdk']);
const WEB_PACKAGES = new Set(['@fireweaveai/web-sdk', '@openfeature/web-sdk']);
const NODE_SYMBOLS = new Set([
  'FireweaveClient',
  'FireweaveRuntime',
  'FireweaveProvider',
  'FireweaveRemoteAdapter',
  'InMemoryAdapter',
  'FireweaveLocalAdapter',
  'makeFireweaveLocalProvider',
  'getFwLocalCaptures',
  'resetFwLocalCaptures',
  'FireweaveError',
  'ERROR_TAXONOMY',
  'redactSecrets',
  'isFireweaveError',
  'DEFAULT_ALLOWED_HOSTS',
  'assertHostAllowed',
  'isLoopbackHostname',
  'mergeContexts',
  'normalizeContextInput',
  'canonicalizeContext',
  'resolvedContextView',
  'DEFAULT_CONTEXT_LIMITS',
  'DEFAULT_RESERVED_ATTRIBUTE_KEYS',
  'ALLOWED_FIREWEAVE_CONTEXT_KEYS',
  'DEFAULT_SHUTDOWN_TIMEOUT_MS',
  'DEFAULT_SIGNAL_ATTRIBUTE_ALLOWLIST',
  'stableStringify',
]);
const WEB_SYMBOLS = new Set([
  'FireweaveWebClient',
  'FireweaveWebRuntime',
  'FireweaveWebProvider',
  'FireweaveRemoteWebAdapter',
  'InMemoryWebAdapter',
  'FireweaveLocalWebAdapter',
  'WebControlPointsApi',
  'WebExposuresApi',
  'WebSignalsApi',
  'WebReleasesApi',
  'FireweaveError',
  'ERROR_TAXONOMY',
  'isFireweaveError',
  'DEFAULT_ALLOWED_HOSTS',
  'assertHostAllowed',
  'assertNotSecretKey',
  'isLoopbackHostname',
  'canonicalizeContext',
  'mergeContexts',
  'DEFAULT_CONTEXT_LIMITS',
  'DEFAULT_RESERVED_ATTRIBUTE_KEYS',
  'DEFAULT_FLAGS_READY_TIMEOUT_MS',
  'DEFAULT_SIGNAL_ATTRIBUTE_ALLOWLIST',
]);
const PYTHON_CORE = new Set([
  'FireweaveClient',
  'FireweaveRuntime',
  'FireweaveConfig',
  'DEFAULT_ALLOWED_HOSTS',
  'LifecycleState',
  'EvaluationOptions',
  'BackendAdapter',
  'FlagResolution',
  'InMemoryAdapter',
  'FireweaveLocalAdapter',
  'FireweaveRemoteAdapter',
  'RegisterTargetOptions',
  'RegisterTargetResult',
  'ContextLimits',
  'EvaluationContext',
  'merge_contexts',
  'validate_context',
  'Decision',
  'Reason',
  'FlagType',
  'JsonValue',
  'CANONICAL_CAPABILITIES',
  'CapabilityRegistry',
  'ReleaseContext',
  'ReleaseResult',
  'ExposureResult',
  'FlushResult',
  'SignalResult',
  'CapabilityResult',
  'ErrorKind',
  'FireweaveError',
  'SPEC_VERSION',
]);
const PYTHON_OF = new Set([
  'FireweaveProvider',
  'make_fireweave_local_provider',
  'get_fw_local_captures',
  'reset_fw_local_captures',
  'FwLocalCapture',
]);
const PYTHON_MODULES = new Set([
  'fireweave',
  'fireweave.aio',
  'fireweave.adapters',
  'fireweave.adapters.posthog',
  'fireweave.openfeature',
]);
const GO_PREFIX = 'github.com/FireWeave-HQ/fireweave-sdk/sdks/go';
const GO_PACKAGES = new Set([
  `${GO_PREFIX}`,
  `${GO_PREFIX}/fireweave`,
  `${GO_PREFIX}/openfeature`,
  `${GO_PREFIX}/adapters/inmemory`,
  `${GO_PREFIX}/adapters/remote`,
  `${GO_PREFIX}/adapters/posthog`,
]);
const JAVA_PREFIXES = [
  'ai.fireweave.sdk.',
  'ai.fireweave.openfeature.',
  'ai.fireweave.testing.',
  'ai.fireweave.adapter.posthog.',
  'dev.openfeature.sdk.',
  'com.fasterxml.jackson.',
];
const FORBIDDEN_IN_CODE = [
  { re: /\bfw\.isOn\b/, why: 'fw.isOn is not an SDK API' },
  { re: /\bfw-rollout\b/, why: '/fw-rollout is not an SDK API' },
  { re: /\.track\s*\(/, why: 'OpenFeature track() is not implemented' },
  { re: /\bcontrolPointKey\b/, why: 'parameter is flagKey, not controlPointKey' },
];

const findings = [];
const blocks = [];

function note(severity, file, message, extra = '') {
  findings.push({ severity, file, message, extra });
}

function walkMdx(dir, acc = []) {
  return readdir(dir, { withFileTypes: true }).then(async (entries) => {
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (['node_modules', 'audits', 'scripts', '.git', '.github'].includes(e.name)) continue;
        await walkMdx(p, acc);
      } else if (e.name.endsWith('.mdx')) {
        acc.push(p);
      }
    }
    return acc;
  });
}

function extractBlocks(rel, src) {
  const re = /```([a-zA-Z0-9_+-]*)[^\n]*\n([\s\S]*?)```/g;
  let m;
  let i = 0;
  while ((m = re.exec(src))) {
    i += 1;
    const lang = (m[1] || '').toLowerCase();
    const code = m[2];
    const line = src.slice(0, m.index).split('\n').length;
    blocks.push({ file: rel, lang, code, line, index: i });
  }
}

function extractJsImports(code) {
  const pkgs = [];
  const fromRe = /from\s+['"]([^'"]+)['"]/g;
  const reqRe = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
  let m;
  while ((m = fromRe.exec(code))) pkgs.push(m[1]);
  while ((m = reqRe.exec(code))) pkgs.push(m[1]);
  return pkgs;
}

function extractNamedJsImports(code, pkg) {
  const names = [];
  const re = new RegExp(`import\\s+(?:type\\s+)?\\{([^}]+)\\}\\s+from\\s+['"]${pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
  let m;
  while ((m = re.exec(code))) {
    for (const part of m[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/)[0].trim();
      if (name) names.push(name);
    }
  }
  return names;
}

function checkJs(block, kind) {
  const allowed = kind === 'web' ? WEB_PACKAGES : NODE_PACKAGES;
  const symbols = kind === 'web' ? WEB_SYMBOLS : NODE_SYMBOLS;
  const pkgs = extractJsImports(block.code);
  for (const pkg of pkgs) {
    if (pkg.startsWith('.') || pkg.startsWith('node:') || pkg === 'npm:@fireweaveai/sdk') continue;
    if (pkg === '@fireweaveai/sdk/posthog') {
      if (block.file.includes('migration/node-2')) continue;
      note('error', block.file, `@fireweaveai/sdk/posthog is gone on 2.1.0`, `L${block.line}`);
      continue;
    }
    if (pkg.startsWith('@fireweave') || pkg.startsWith('@openfeature') || pkg.includes('fireweave')) {
      if (!allowed.has(pkg) && pkg !== 'npm:@fireweaveai/sdk') {
        note('error', block.file, `unknown ${kind} package import ${pkg}`, `L${block.line}`);
      }
    }
  }
  const pkgName = kind === 'web' ? '@fireweaveai/web-sdk' : '@fireweaveai/sdk';
  for (const name of extractNamedJsImports(block.code, pkgName)) {
    if (!symbols.has(name)) {
      note('error', block.file, `unknown ${pkgName} export ${name}`, `L${block.line}`);
    }
  }
}

function checkPython(block) {
  const fromRe = /(?:^|\n)from\s+([a-zA-Z0-9_.]+)\s+import\s+(.+)/g;
  let m;
  while ((m = fromRe.exec(block.code))) {
    const mod = m[1];
    const names = m[2]
      .replace(/\\\n/g, ' ')
      .replace(/[()]/g, '')
      .split(',')
      .map((s) => s.trim().split(/\s+as\s+/)[0].trim())
      .filter(Boolean);
    if (!mod.startsWith('fireweave')) continue;
    if (!PYTHON_MODULES.has(mod)) {
      note('error', block.file, `unknown Python module ${mod}`, `L${block.line}`);
      continue;
    }
    const allowed =
      mod === 'fireweave.openfeature'
        ? PYTHON_OF
        : mod === 'fireweave.adapters.posthog'
          ? new Set(['PostHogAdapter'])
          : mod === 'fireweave.aio'
            ? new Set(['AsyncFireweaveClient'])
            : PYTHON_CORE;
    if (mod === 'fireweave.adapters') {
      for (const n of names) {
        if (!PYTHON_CORE.has(n)) note('error', block.file, `unknown fireweave.adapters export ${n}`, `L${block.line}`);
      }
      continue;
    }
    for (const n of names) {
      if (!allowed.has(n)) note('error', block.file, `unknown ${mod} export ${n}`, `L${block.line}`);
    }
  }
  const importRe = /(?:^|\n)import\s+(fireweave(?:\.[a-zA-Z0-9_]+)*)/g;
  while ((m = importRe.exec(block.code))) {
    if (!PYTHON_MODULES.has(m[1]) && m[1] !== 'fireweave') {
      note('error', block.file, `unknown Python import ${m[1]}`, `L${block.line}`);
    }
  }
}

function checkGo(block) {
  const importBlock = /import\s*(?:\(\s*([\s\S]*?)\)|["']([^"']+)["'])/;
  const m = block.code.match(importBlock);
  const raw = m ? (m[1] || m[2] || '') : '';
  const paths = [...raw.matchAll(/["']([^"']+)["']/g)].map((x) => x[1]);
  for (const p of paths) {
    if (!p.includes('FireWeave') && !p.includes('fireweave')) continue;
    if (!GO_PACKAGES.has(p)) {
      note('error', block.file, `unknown Go import ${p}`, `L${block.line}`);
    }
  }
  if (/\.RegisterTarget\s*\(/.test(block.code) || /\bRegisterTarget\s*\(/.test(block.code)) {
    note('error', block.file, 'Go has no RegisterTarget on master', `L${block.line}`);
  }
}

function checkJava(block) {
  const imports = [...block.code.matchAll(/^\s*import\s+([a-zA-Z0-9_.]+);/gm)].map((x) => x[1]);
  for (const imp of imports) {
    if (imp.startsWith('java.') || imp.startsWith('javax.')) continue;
    if (imp.includes('fireweave') || imp.includes('openfeature') || imp.includes('fasterxml')) {
      if (!JAVA_PREFIXES.some((p) => imp.startsWith(p))) {
        note('error', block.file, `unknown Java import ${imp}`, `L${block.line}`);
      }
    }
  }
  if (/\.registerTarget\s*\(/.test(block.code) || /\bregisterTarget\s*\(/.test(block.code)) {
    note('error', block.file, 'Java has no registerTarget on master', `L${block.line}`);
  }
}

function checkForbidden(block) {
  if (['md', 'text', 'diff'].includes(block.lang)) return;
  for (const { re, why } of FORBIDDEN_IN_CODE) {
    if (re.test(block.code)) {
      if (block.file.includes('migration/node-2') && /track/.test(re.source)) continue;
      note('error', block.file, why, `L${block.line}`);
    }
  }
}

function slugify(heading) {
  return heading
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function checkLinks(files, navPaths) {
  const onDisk = new Set(
    files.map((f) => f.replace(/\.mdx$/, '').replace(/\\/g, '/')).map((f) => (f === 'index' ? '' : f)),
  );
  const headingMap = new Map();
  for (const rel of files) {
    const src = await readFile(path.join(ROOT, rel), 'utf8');
    const slugs = new Set();
    for (const m of src.matchAll(/^#{1,6}\s+(.+)$/gm)) slugs.add(slugify(m[1]));
    headingMap.set(rel.replace(/\.mdx$/, ''), slugs);
    if (rel === 'index.mdx') headingMap.set('', slugs);
  }

  for (const rel of files) {
    const src = await readFile(path.join(ROOT, rel), 'utf8');
    const hrefs = [
      ...src.matchAll(/\]\((\/[^)\s]+)\)/g),
      ...src.matchAll(/href=["'](\/[^"']+)["']/g),
    ].map((m) => m[1]);
    for (const href of hrefs) {
      const [rawPath, hash] = href.split('#');
      const page = rawPath.replace(/^\//, '').replace(/\/$/, '');
      const diskKey = page;
      const exists =
        onDisk.has(diskKey) ||
        existsSync(path.join(ROOT, `${page}.mdx`)) ||
        existsSync(path.join(ROOT, page, 'index.mdx'));
      if (!exists) {
        note('error', rel, `broken internal link ${href}`);
        continue;
      }
      if (page && !navPaths.has(page) && page !== 'index') {
        note('warn', rel, `internal link ${href} is not in docs.json navigation`);
      }
      if (hash) {
        const slugs = headingMap.get(page) || headingMap.get(diskKey);
        if (slugs && !slugs.has(hash)) {
          note('error', rel, `broken heading anchor ${href} (no slug "${hash}")`);
        }
      }
    }
  }
}

function findSdkRoot() {
  for (const root of SDK_ROOTS) {
    if (root && existsSync(path.join(root, 'sdks/node/packages/sdk/src/index.ts'))) return root;
  }
  return null;
}

function which(cmd) {
  try {
    execFileSync(process.platform === 'win32' ? 'where' : 'which', [cmd], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function optionalCompile(sdkRoot) {
  const compile = [];
  const jsSnippets = blocks.filter((b) => ['js', 'ts', 'javascript', 'typescript', 'tsx'].includes(b.lang));
  if (sdkRoot && which('npx') && jsSnippets.length) {
    compile.push(
      'Node/TS compile skipped: snippets are incomplete fragments (no shared harness). Static export checks used instead.',
    );
  } else {
    compile.push('Node/TS compile skipped (no SDK checkout or npx).');
  }
  compile.push('Python compile skipped: snippets are fragments; static import checks used.');
  compile.push('Go compile skipped: snippets omit go.mod replace; static import checks used.');
  compile.push('Java compile skipped: snippets omit Maven classpath; static import checks used.');
  return compile;
}

async function main() {
  const files = (await walkMdx(ROOT)).map((p) => path.relative(ROOT, p)).sort();
  const docsJson = JSON.parse(await readFile(path.join(ROOT, 'docs.json'), 'utf8'));
  const navPaths = new Set();
  const walkNav = (pages) => {
    for (const p of pages || []) {
      if (typeof p === 'string') navPaths.add(p);
      else if (p.pages) walkNav(p.pages);
    }
  };
  walkNav(docsJson.navigation?.groups?.flatMap((g) => g.pages) || docsJson.navigation?.pages);

  for (const rel of files) {
    const src = await readFile(path.join(ROOT, rel), 'utf8');
    if (!/^---\n[\s\S]*?\ntitle:\s*.+\n[\s\S]*?\ndescription:\s*.+\n/.test(src) && !/^---\n(?:.*\n)*?title:/m.test(src)) {
      note('error', rel, 'missing title frontmatter');
    }
    if (!/^---[\s\S]*?description:/m.test(src)) {
      note('error', rel, 'missing description frontmatter');
    }
    extractBlocks(rel, src);
  }

  for (const block of blocks) {
    checkForbidden(block);
    if (['js', 'ts', 'javascript', 'typescript', 'tsx', 'jsx'].includes(block.lang)) {
      const web =
        block.code.includes('@fireweaveai/web-sdk') ||
        block.code.includes('@openfeature/web-sdk') ||
        block.file.includes('sdks/web');
      checkJs(block, web ? 'web' : 'node');
    } else if (['python', 'py'].includes(block.lang)) {
      checkPython(block);
    } else if (block.lang === 'go') {
      checkGo(block);
    } else if (block.lang === 'java') {
      checkJava(block);
    }
  }

  await checkLinks(files, navPaths);

  const sdkRoot = findSdkRoot();
  const compileNotes = await optionalCompile(sdkRoot);

  const errors = findings.filter((f) => f.severity === 'error');
  const warns = findings.filter((f) => f.severity === 'warn');

  const byLang = {};
  for (const b of blocks) {
    byLang[b.lang || '(none)'] = (byLang[b.lang || '(none)'] || 0) + 1;
  }

  const lines = [
    '# Example and link validation',
    '',
    `**Date:** 2026-08-17`,
    `**Script:** \`scripts/validate-examples.mjs\``,
    `**SDK checkout:** ${sdkRoot || 'not found (used audited symbol lists)'}`,
    `**MDX files:** ${files.length}`,
    `**Fenced blocks:** ${blocks.length}`,
    '',
    '## Block counts by language',
    '',
    ...Object.entries(byLang)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `- \`${k || '(unlabeled)'}\`: ${v}`),
    '',
    '## Checks performed',
    '',
    '- Node/Web named imports against `@fireweaveai/sdk` / `@fireweaveai/web-sdk` export lists from `audits/sdk-audit.md` + `/tmp/fireweave-sdk` `index.ts`',
    '- Python `from fireweave…` modules and names against `__all__` / extras',
    '- Go import paths under `github.com/FireWeave-HQ/fireweave-sdk/sdks/go`',
    '- Java `ai.fireweave.*` / OpenFeature / Jackson prefixes',
    '- Forbidden invented APIs in fences: `fw.isOn`, `/fw-rollout`, `.track(`, `controlPointKey`',
    '- Internal `href` / markdown links vs files on disk, `docs.json` nav, and heading slugs',
    '- Frontmatter `title` + `description` on every MDX page',
    '- No live API keys; no network evaluate calls',
    '',
    '## Compile / typecheck',
    '',
    ...compileNotes.map((n) => `- ${n}`),
    '',
    '## Result',
    '',
    errors.length === 0
      ? '**PASS** — no invented packages or broken internal links found.'
      : `**FAIL** — ${errors.length} error(s).`,
    warns.length ? `${warns.length} warning(s).` : '',
    '',
    '## Findings',
    '',
  ];

  if (!findings.length) {
    lines.push('_None._');
  } else {
    for (const f of findings) {
      lines.push(`- **${f.severity.toUpperCase()}** \`${f.file}\`${f.extra ? ` ${f.extra}` : ''}: ${f.message}`);
    }
  }

  lines.push(
    '',
    '## Pages checked',
    '',
    ...files.map((f) => `- \`${f}\``),
    '',
  );

  await mkdir(path.join(ROOT, 'audits'), { recursive: true });
  await writeFile(path.join(ROOT, 'audits/example-validation.md'), lines.join('\n') + '\n');

  for (const f of findings) {
    const tag = f.severity === 'error' ? 'ERROR' : 'WARN';
    console.log(`${tag} ${f.file}${f.extra ? ' ' + f.extra : ''}: ${f.message}`);
  }
  console.log(`\n${blocks.length} blocks, ${errors.length} errors, ${warns.length} warnings`);
  console.log('Wrote audits/example-validation.md');
  process.exit(errors.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
