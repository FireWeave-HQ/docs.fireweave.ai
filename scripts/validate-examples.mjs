#!/usr/bin/env node
/**
 * Extract fenced code blocks from MDX and statically check Fireweave
 * package names / imports against the current SDK surfaces.
 * Does not require live API keys. Optional compile if local toolchains exist.
 *
 * Surfaces are derived from FIREWEAVE_SDK_ROOT (or a local checkout), not a
 * hardcoded snapshot — the previous lists went stale the day ADR-0010 landed.
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

/** Checkout layouts we can load a surface from (v1 first, pre-v1 last). */
const SDK_MARKERS = ['sdks/node/src/index.ts', 'sdks/node/packages/sdk/src/index.ts'];

/**
 * Retired pre-v1 identifiers. These cannot be derived from the current SDK
 * (they were deleted). Allowed only on migration pages that show "before".
 */
const RETIRED_JS_PACKAGES = new Set([
  '@fireweaveai/sdk',
  '@fireweaveai/sdk/posthog',
  '@openfeature/server-sdk',
  '@openfeature/web-sdk',
]);
const RETIRED_JS_SYMBOLS = new Set([
  'FireweaveProvider',
  'FireweaveWebProvider',
  'makeFireweaveLocalProvider',
  'getFwLocalCaptures',
  'resetFwLocalCaptures',
  'WebExposuresApi',
  'WebSignalsApi',
  'WebReleasesApi',
]);
const RETIRED_PYTHON_MODULES = new Set([
  'fireweave.openfeature',
  'fireweave.aio',
  'fireweave.adapters',
  'fireweave.adapters.posthog',
]);

const FORBIDDEN_IN_CODE = [
  { re: /\bfw\.isOn\b/, why: 'fw.isOn is not an SDK API' },
  { re: /\bfw-rollout\b/, why: '/fw-rollout is not an SDK API' },
  { re: /\.track\s*\(/, why: 'OpenFeature track() is not implemented' },
  { re: /\bcontrolPointKey\b/, why: 'parameter is flagKey, not controlPointKey' },
];

const SWIFT_STDLIB = new Set([
  'Foundation',
  'Swift',
  'UIKit',
  'SwiftUI',
  'Combine',
  'AppKit',
  'os',
  'Darwin',
  'Dispatch',
  'CoreFoundation',
]);

const findings = [];
const blocks = [];

function note(severity, file, message, extra = '') {
  findings.push({ severity, file, message, extra });
}

function isHistoricalDoc(file) {
  return file.startsWith('migration/');
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

async function walkFiles(dir, pred, acc = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', 'target', 'dist', 'build'].includes(e.name)) continue;
      await walkFiles(p, pred, acc);
    } else if (pred(p, e.name)) {
      acc.push(p);
    }
  }
  return acc;
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
  const re = new RegExp(
    `import\\s+(?:type\\s+)?\\{([^}]+)\\}\\s+from\\s+['"]${pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
    'g',
  );
  let m;
  while ((m = re.exec(code))) {
    for (const part of m[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/)[0].trim();
      if (name) names.push(name);
    }
  }
  return names;
}

/** Deno `npm:@scope/name` / `npm:@scope/name@version` → `@scope/name`. */
function normalizeJsPackage(spec) {
  let pkg = spec.startsWith('npm:') ? spec.slice(4) : spec;
  const scoped = pkg.match(/^(@[^/]+\/[^@]+)(?:@.+)?$/);
  if (scoped) return scoped[1];
  const unscoped = pkg.match(/^([^@/]+)(?:@.+)?$/);
  if (unscoped) return unscoped[1];
  return pkg;
}

function extractTsExports(src) {
  const names = new Set();
  for (const m of src.matchAll(/export\s+(?:type\s+)?\{([^}]+)\}/g)) {
    for (const part of m[1].split(',')) {
      const cleaned = part.replace(/^\s*type\s+/, '').trim();
      if (!cleaned) continue;
      const bits = cleaned.split(/\s+as\s+/);
      const name = (bits[1] || bits[0]).trim();
      if (name && name !== 'type') names.add(name);
    }
  }
  for (const m of src.matchAll(
    /export\s+(?:async\s+)?(?:declare\s+)?(?:default\s+)?(?:type|interface|class|function|const|let|var|enum)\s+([A-Za-z_$][\w$]*)/g,
  )) {
    names.add(m[1]);
  }
  return names;
}

function extractQuotedName(src, section) {
  if (section) {
    const block = src.match(new RegExp(`\\[${section.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\]([^\\[]*)`));
    if (block) {
      const m = block[1].match(/^\s*name\s*=\s*"([^"]+)"/m);
      if (m) return m[1];
    }
  }
  const m = src.match(/^\s*name\s*=\s*"([^"]+)"/m);
  return m ? m[1] : null;
}

function extractPythonAll(src) {
  const m = src.match(/__all__\s*=\s*\[([\s\S]*?)\]/);
  if (!m) return null;
  return new Set([...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1]));
}

function extractPythonPublic(src) {
  const names = new Set();
  for (const m of src.matchAll(/^(?:async\s+)?def\s+([A-Za-z_][\w]*)/gm)) {
    if (!m[1].startsWith('_')) names.add(m[1]);
  }
  for (const m of src.matchAll(/^class\s+([A-Za-z_][\w]*)/gm)) {
    if (!m[1].startsWith('_')) names.add(m[1]);
  }
  return names;
}

function extractRustExports(src) {
  const names = new Set();
  for (const m of src.matchAll(/pub\s+use\s+[A-Za-z0-9_:]+::\{([^}]+)\}/g)) {
    for (const part of m[1].split(',')) {
      const bits = part.trim().split(/\s+as\s+/);
      const name = (bits[1] || bits[0]).trim();
      if (name) names.add(name);
    }
  }
  for (const m of src.matchAll(/pub\s+use\s+[A-Za-z0-9_:]+::([A-Za-z_][A-Za-z0-9_]*)\s*;/g)) {
    names.add(m[1]);
  }
  for (const m of src.matchAll(/pub\s+(?:const|fn|struct|enum|trait|type|mod)\s+([A-Za-z_][A-Za-z0-9_]*)/g)) {
    names.add(m[1]);
  }
  return names;
}

function extractSwiftPublic(src) {
  const names = new Set();
  const re =
    /public\s+(?:(?:final|static|class|indirect|nonisolated|package)\s+)*(?:func|struct|class|enum|protocol|actor|typealias|let|var)\s+([A-Za-z_][A-Za-z0-9_]*)/g;
  let m;
  while ((m = re.exec(src))) names.add(m[1]);
  return names;
}

function packagesFromManifest(pkgJson) {
  const names = new Set();
  const name = pkgJson.name;
  if (!name) return names;
  names.add(name);
  const exportsField = pkgJson.exports;
  if (exportsField && typeof exportsField === 'object' && !Array.isArray(exportsField)) {
    for (const key of Object.keys(exportsField)) {
      if (key === '.') names.add(name);
      else if (key.startsWith('./')) names.add(name + key.slice(1));
    }
  }
  return names;
}

function emptySurface() {
  return {
    found: false,
    layout: null,
    nodePackage: null,
    webPackage: null,
    nodePackages: new Set(),
    webPackages: new Set(),
    nodeSymbols: new Set(),
    webSymbols: new Set(),
    pythonPackage: null,
    pythonModules: new Map(),
    goModule: null,
    goPackages: new Set(),
    javaTypes: new Set(),
    rustCrate: null,
    rustSymbols: new Set(),
    swiftModule: null,
    swiftSymbols: new Set(),
  };
}

async function loadSdkSurface(sdkRoot) {
  const surface = emptySurface();
  if (!sdkRoot) return surface;
  surface.found = true;

  const nodeIndex = existsSync(path.join(sdkRoot, 'sdks/node/src/index.ts'))
    ? path.join(sdkRoot, 'sdks/node/src/index.ts')
    : existsSync(path.join(sdkRoot, 'sdks/node/packages/sdk/src/index.ts'))
      ? path.join(sdkRoot, 'sdks/node/packages/sdk/src/index.ts')
      : null;
  surface.layout = nodeIndex && nodeIndex.includes('packages/sdk') ? 'pre-v1' : 'v1';

  const nodeManifest = nodeIndex
    ? path.join(path.dirname(nodeIndex), '..', 'package.json')
    : path.join(sdkRoot, 'sdks/node/package.json');
  if (existsSync(nodeManifest)) {
    const pkg = JSON.parse(await readFile(nodeManifest, 'utf8'));
    surface.nodePackage = pkg.name || null;
    surface.nodePackages = packagesFromManifest(pkg);
  }
  if (nodeIndex) {
    surface.nodeSymbols = extractTsExports(await readFile(nodeIndex, 'utf8'));
  }

  const webIndex = path.join(sdkRoot, 'sdks/web/src/index.ts');
  const webManifest = path.join(sdkRoot, 'sdks/web/package.json');
  if (existsSync(webManifest)) {
    const pkg = JSON.parse(await readFile(webManifest, 'utf8'));
    surface.webPackage = pkg.name || null;
    surface.webPackages = packagesFromManifest(pkg);
  }
  if (existsSync(webIndex)) {
    surface.webSymbols = extractTsExports(await readFile(webIndex, 'utf8'));
  }

  const pyProject = path.join(sdkRoot, 'sdks/python/pyproject.toml');
  const pyRoot = path.join(sdkRoot, 'sdks/python/src/fireweave');
  if (existsSync(pyProject)) {
    surface.pythonPackage = extractQuotedName(await readFile(pyProject, 'utf8'), 'project') || 'fireweave';
  }
  if (existsSync(pyRoot)) {
    const pyFiles = await walkFiles(pyRoot, (_p, name) => name.endsWith('.py') && !name.startsWith('_'));
    const initFiles = await walkFiles(pyRoot, (_p, name) => name === '__init__.py');
    const all = new Set([...pyFiles, ...initFiles]);
    for (const file of all) {
      const rel = path.relative(path.join(sdkRoot, 'sdks/python/src'), file).replace(/\\/g, '/');
      const noExt = rel.replace(/\.py$/, '');
      const mod = noExt.endsWith('/__init__')
        ? noExt.slice(0, -'/__init__'.length).replace(/\//g, '.')
        : noExt.replace(/\//g, '.');
      const src = await readFile(file, 'utf8');
      const names = extractPythonAll(src) || (path.basename(file) === '__init__.py' ? new Set() : extractPythonPublic(src));
      if (!surface.pythonModules.has(mod) || names.size) {
        surface.pythonModules.set(mod, names);
      }
    }
    if (surface.pythonPackage && !surface.pythonModules.has(surface.pythonPackage)) {
      surface.pythonModules.set(surface.pythonPackage, new Set());
    }
  }

  const goModPath = path.join(sdkRoot, 'sdks/go/go.mod');
  if (existsSync(goModPath)) {
    const goMod = await readFile(goModPath, 'utf8');
    const mod = goMod.match(/^module\s+(\S+)/m);
    surface.goModule = mod ? mod[1] : null;
    const goRoot = path.join(sdkRoot, 'sdks/go');
    const goFiles = await walkFiles(goRoot, (p, name) => {
      if (!name.endsWith('.go') || name.endsWith('_test.go')) return false;
      const rel = path.relative(goRoot, p).replace(/\\/g, '/');
      return !rel.startsWith('internal/') && !rel.startsWith('cmd/');
    });
    for (const file of goFiles) {
      const dir = path.relative(goRoot, path.dirname(file)).replace(/\\/g, '/');
      if (!dir || dir === '.') continue;
      if (surface.goModule) surface.goPackages.add(`${surface.goModule}/${dir}`);
    }
  }

  const javaRoot = path.join(sdkRoot, 'sdks/java');
  if (existsSync(javaRoot)) {
    const javaFiles = await walkFiles(javaRoot, (p, name) => {
      if (!name.endsWith('.java')) return false;
      return p.replace(/\\/g, '/').includes('/src/main/java/');
    });
    for (const file of javaFiles) {
      const src = await readFile(file, 'utf8');
      const pkg = src.match(/^package\s+([a-zA-Z0-9_.]+)\s*;/m);
      if (!pkg) continue;
      for (const m of src.matchAll(
        /public\s+(?:(?:final|abstract|sealed|static)\s+)*(?:class|interface|enum|record)\s+([A-Za-z_][\w]*)/g,
      )) {
        surface.javaTypes.add(`${pkg[1]}.${m[1]}`);
      }
    }
  }

  const cargo = path.join(sdkRoot, 'sdks/rust/Cargo.toml');
  const rustLib = path.join(sdkRoot, 'sdks/rust/src/lib.rs');
  if (existsSync(cargo)) {
    surface.rustCrate = extractQuotedName(await readFile(cargo, 'utf8'), 'package');
  }
  if (existsSync(rustLib)) {
    surface.rustSymbols = extractRustExports(await readFile(rustLib, 'utf8'));
  }

  const swiftPkg = path.join(sdkRoot, 'sdks/swift/Package.swift');
  if (existsSync(swiftPkg)) {
    const src = await readFile(swiftPkg, 'utf8');
    const lib = src.match(/\.library\s*\(\s*name:\s*"([^"]+)"/);
    const pkgName = src.match(/let\s+package\s*=\s*Package\(\s*name:\s*"([^"]+)"/);
    surface.swiftModule = (lib && lib[1]) || (pkgName && pkgName[1]) || null;
    const swiftFiles = await walkFiles(path.join(sdkRoot, 'sdks/swift/Sources'), (_p, name) => name.endsWith('.swift'));
    for (const file of swiftFiles) {
      if (file.replace(/\\/g, '/').includes('/FireweaveConformance/')) continue;
      for (const name of extractSwiftPublic(await readFile(file, 'utf8'))) {
        surface.swiftSymbols.add(name);
      }
    }
  }

  return surface;
}

function checkJs(block, kind, surface) {
  const allowed = kind === 'web' ? surface.webPackages : surface.nodePackages;
  const symbols = kind === 'web' ? surface.webSymbols : surface.nodeSymbols;
  const pkgName = kind === 'web' ? surface.webPackage : surface.nodePackage;
  const pkgs = extractJsImports(block.code);
  for (const raw of pkgs) {
    if (raw.startsWith('.') || raw.startsWith('node:')) continue;
    const pkg = normalizeJsPackage(raw);
    if (RETIRED_JS_PACKAGES.has(pkg)) {
      if (isHistoricalDoc(block.file)) continue;
      note(
        'error',
        block.file,
        `retired ${kind} package import ${raw}`,
        `L${block.line}`,
      );
      continue;
    }
    if (pkg.startsWith('@fireweave') || pkg.startsWith('@openfeature') || pkg.includes('fireweave')) {
      if (!allowed.has(pkg)) {
        note('error', block.file, `unknown ${kind} package import ${raw}`, `L${block.line}`);
      }
    }
  }
  if (!pkgName || !symbols.size) return;
  for (const spec of [pkgName, `npm:${pkgName}`]) {
    for (const name of extractNamedJsImports(block.code, spec)) {
      if (RETIRED_JS_SYMBOLS.has(name) && isHistoricalDoc(block.file)) continue;
      if (!symbols.has(name)) {
        note('error', block.file, `unknown ${pkgName} export ${name}`, `L${block.line}`);
      }
    }
  }
}

function checkPython(block, surface) {
  const fromRe = /(?:^|\n)from\s+([a-zA-Z0-9_.]+)\s+import\s+(\([\s\S]*?\)|[^\n]+)/g;
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
    if (RETIRED_PYTHON_MODULES.has(mod)) {
      if (isHistoricalDoc(block.file)) continue;
      note('error', block.file, `retired Python module ${mod}`, `L${block.line}`);
      continue;
    }
    if (!surface.pythonModules.has(mod)) {
      note('error', block.file, `unknown Python module ${mod}`, `L${block.line}`);
      continue;
    }
    const allowed = surface.pythonModules.get(mod);
    if (!allowed || !allowed.size) continue;
    for (const n of names) {
      if (!allowed.has(n)) note('error', block.file, `unknown ${mod} export ${n}`, `L${block.line}`);
    }
  }
  const importRe = /(?:^|\n)import\s+(fireweave(?:\.[a-zA-Z0-9_]+)*)/g;
  while ((m = importRe.exec(block.code))) {
    if (RETIRED_PYTHON_MODULES.has(m[1]) && isHistoricalDoc(block.file)) continue;
    if (!surface.pythonModules.has(m[1]) && m[1] !== (surface.pythonPackage || 'fireweave')) {
      note('error', block.file, `unknown Python import ${m[1]}`, `L${block.line}`);
    }
  }
}

function extractGoImports(code) {
  const paths = [];
  const grouped = code.match(/import\s*\(([\s\S]*?)\)/);
  if (grouped) {
    for (const m of grouped[1].matchAll(/["']([^"']+)["']/g)) paths.push(m[1]);
  }
  // import "path" / import alias "path" / import . "path" / import _ "path"
  const single = /(?:^|\n)\s*import\s+(?:(?:[A-Za-z_][\w]*|\.|_)\s+)?["']([^"']+)["']/g;
  let m;
  while ((m = single.exec(code))) paths.push(m[1]);
  return [...new Set(paths)];
}

function goLegacyModulePrefix(goModule) {
  if (!goModule) return null;
  const m = goModule.match(/\/v\d+$/);
  return m ? goModule.slice(0, -m[0].length) : null;
}

function checkGo(block, surface) {
  const module = surface.goModule;
  const legacy = goLegacyModulePrefix(module);
  for (const p of extractGoImports(block.code)) {
    if (!p.includes('FireWeave') && !p.includes('fireweave')) continue;
    if (surface.goPackages.has(p)) continue;
    const underCurrent = module && (p === module || p.startsWith(`${module}/`));
    const underLegacy = legacy && (p === legacy || p.startsWith(`${legacy}/`));
    if (underLegacy && !underCurrent && isHistoricalDoc(block.file)) continue;
    if (underLegacy && !underCurrent) {
      note(
        'error',
        block.file,
        `unknown Go import ${p} (pre-/v2 module path; current module is ${module})`,
        `L${block.line}`,
      );
      continue;
    }
    note('error', block.file, `unknown Go import ${p}`, `L${block.line}`);
  }
}

function checkJava(block, surface) {
  const imports = [...block.code.matchAll(/^\s*import\s+(?:static\s+)?([a-zA-Z0-9_.]+(?:\.\*)?);/gm)].map(
    (x) => x[1],
  );
  for (const imp of imports) {
    if (imp.startsWith('java.') || imp.startsWith('javax.')) continue;
    if (!imp.includes('fireweave') && !imp.includes('openfeature')) continue;
    if (imp.endsWith('.*')) {
      const prefix = imp.slice(0, -1);
      const ok = [...surface.javaTypes].some((t) => t.startsWith(prefix));
      if (!ok) note('error', block.file, `unknown Java import ${imp}`, `L${block.line}`);
      continue;
    }
    if (!surface.javaTypes.has(imp)) {
      note('error', block.file, `unknown Java import ${imp}`, `L${block.line}`);
    }
  }
}

function checkRust(block, surface) {
  if (!surface.rustCrate) return;
  const crate = surface.rustCrate;
  const names = [];
  const brace = new RegExp(`use\\s+${crate}::\\{([^}]+)\\}`, 'g');
  let m;
  while ((m = brace.exec(block.code))) {
    for (const part of m[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/)[0].trim();
      if (name) names.push(name);
    }
  }
  const single = new RegExp(`use\\s+${crate}::([A-Za-z_][A-Za-z0-9_]*)`, 'g');
  while ((m = single.exec(block.code))) names.push(m[1]);
  for (const name of names) {
    if (!surface.rustSymbols.has(name)) {
      note('error', block.file, `unknown ${crate} export ${name}`, `L${block.line}`);
    }
  }
}

function checkSwift(block, surface) {
  if (!surface.swiftModule) return;
  const imports = [...block.code.matchAll(/^\s*import\s+([A-Za-z_][A-Za-z0-9_]*)/gm)].map((x) => x[1]);
  for (const imp of imports) {
    if (SWIFT_STDLIB.has(imp)) continue;
    if (/fireweave/i.test(imp) && imp !== surface.swiftModule) {
      note('error', block.file, `unknown Swift module ${imp}`, `L${block.line}`);
    }
  }
  if (!surface.swiftSymbols.size) return;
  const ids = [
    ...block.code.matchAll(/\b((?:initFireweave|InitFireweave|Fireweave)[A-Za-z0-9_]*)\b/g),
  ].map((x) => x[1]);
  for (const id of new Set(ids)) {
    if (id === surface.swiftModule) continue;
    if (!surface.swiftSymbols.has(id)) {
      note('error', block.file, `unknown ${surface.swiftModule} symbol ${id}`, `L${block.line}`);
    }
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
    const hrefs = [...src.matchAll(/\]\((\/[^)\s]+)\)/g), ...src.matchAll(/href=["'](\/[^"']+)["']/g)].map(
      (m) => m[1],
    );
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
    if (!root) continue;
    if (SDK_MARKERS.some((marker) => existsSync(path.join(root, marker)))) return root;
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
  compile.push('Rust compile skipped: snippets omit Cargo harness; static import checks used.');
  compile.push('Swift compile skipped: snippets omit Package.swift harness; static import checks used.');
  return compile;
}

function classifyJsKind(block, surface) {
  const webPkg = surface.webPackage || '@fireweaveai/web-sdk';
  if (
    block.code.includes(webPkg) ||
    block.code.includes('@openfeature/web-sdk') ||
    block.file.includes('sdks/web')
  ) {
    return 'web';
  }
  return 'node';
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

  const sdkRoot = findSdkRoot();
  const surface = await loadSdkSurface(sdkRoot);
  if (!surface.found) {
    note('error', 'scripts/validate-examples.mjs', 'SDK checkout not found; set FIREWEAVE_SDK_ROOT');
  }

  for (const block of blocks) {
    checkForbidden(block);
    if (!surface.found) continue;
    if (['js', 'ts', 'javascript', 'typescript', 'tsx', 'jsx'].includes(block.lang)) {
      checkJs(block, classifyJsKind(block, surface), surface);
    } else if (['python', 'py'].includes(block.lang)) {
      checkPython(block, surface);
    } else if (block.lang === 'go') {
      checkGo(block, surface);
    } else if (block.lang === 'java') {
      checkJava(block, surface);
    } else if (block.lang === 'rust') {
      checkRust(block, surface);
    } else if (block.lang === 'swift') {
      checkSwift(block, surface);
    }
  }

  await checkLinks(files, navPaths);

  const compileNotes = await optionalCompile(sdkRoot);

  const errors = findings.filter((f) => f.severity === 'error');
  const warns = findings.filter((f) => f.severity === 'warn');

  const byLang = {};
  for (const b of blocks) {
    byLang[b.lang || '(none)'] = (byLang[b.lang || '(none)'] || 0) + 1;
  }

  const nodePkg = surface.nodePackage || '@fireweaveai/server-sdk';
  const webPkg = surface.webPackage || '@fireweaveai/web-sdk';
  const goMod = surface.goModule || 'github.com/FireWeave-HQ/fireweave-sdk/sdks/go/v2';
  const rustCrate = surface.rustCrate || 'fireweave';
  const swiftMod = surface.swiftModule || 'Fireweave';

  const lines = [
    '# Example and link validation',
    '',
    `**Date:** ${new Date().toISOString().slice(0, 10)}`,
    `**Script:** \`scripts/validate-examples.mjs\``,
    `**SDK checkout:** ${sdkRoot || 'not found'}`,
    `**SDK layout:** ${surface.layout || 'n/a'}`,
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
    `- Node/Web named imports against \`${nodePkg}\` / \`${webPkg}\` exports parsed from each SDK \`index.ts\` and package names from \`package.json\``,
    '- Deno `npm:` specifiers accepted as aliases of the same package name',
    '- Python `from fireweave…` modules and names against package `__all__` / public defs under `sdks/python/src`',
    `- Go import paths must be a public package under the module in \`sdks/go/go.mod\` (currently \`${goMod}\`); pre-\`/v2\` paths are errors except on \`migration/\` pages`,
    '- Java `ai.fireweave.*` types walked from `sdks/java/*/src/main/java`',
    `- Rust \`use ${rustCrate}::…\` names against \`pub use\` / \`pub fn\` in \`sdks/rust/src/lib.rs\``,
    `- Swift \`import ${swiftMod}\` plus Fireweave-prefixed symbols from \`Sources/Fireweave\``,
    '- Forbidden invented APIs in fences: `fw.isOn`, `/fw-rollout`, `.track(`, `controlPointKey`',
    '- Retired pre-v1 packages/symbols (`@fireweaveai/sdk`, OpenFeature providers, cut namespaces) rejected except on `migration/` pages',
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

  lines.push('', '## Pages checked', '', ...files.map((f) => `- \`${f}\``), '');

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
