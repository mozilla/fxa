/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Generate `generated/nova-tokens.css` from the vendored Nova design-system CSS plus the
 * hand-authored config in `config/`.
 *
 * Output = four blocks scoped by attribute so the Nova refresh can be toggled at runtime
 * with `data-theme="nova"` on <html>, and light/dark keeps working with our existing
 * class-based dark mode (`darkMode: 'class'`):
 *
 *   :root                     legacy (flag off), light      — seeded to TODAY's values
 *   .dark                     legacy (flag off), dark
 *   :root[data-theme="nova"]  Nova, light
 *   [data-theme="nova"].dark  Nova, dark
 *
 * Nova ships light/dark via the CSS `light-dark()` function; we rewrite it into the two
 * class-based scopes above.
 *
 * Run: `nx run shared-design-tokens:generate`
 *   or (bootstrap from a Firefox checkout, no vendoring):
 *      NOVA_SRC=../../../../firefox/toolkit/themes/shared/design-system/dist \
 *        node src/generate.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { legacyPrimitiveVars } from './config/legacy-palette.mjs';
import {
  SEMANTIC_ALLOWLIST,
  PRIMITIVE_ALIASES_NOVA,
  LEGACY_SEMANTICS,
} from './config/token-map.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIB_ROOT = resolve(__dirname, '..');
const NOVA_SRC = process.env.NOVA_SRC
  ? resolve(process.cwd(), process.env.NOVA_SRC)
  : join(__dirname, 'vendor');
const OUT = join(LIB_ROOT, 'generated', 'nova-tokens.css');

// ---------------------------------------------------------------------------
// tiny CSS helpers (the vendored input is generated + regular, so this is enough)
// ---------------------------------------------------------------------------

/** Return the body between the matching braces starting at the first `{` after `from`. */
function balancedBody(str, from) {
  const open = str.indexOf('{', from);
  if (open === -1) throw new Error('no opening brace');
  let depth = 0;
  for (let i = open; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}' && --depth === 0) {
      return { body: str.slice(open + 1, i), end: i + 1 };
    }
  }
  throw new Error('unbalanced braces');
}

/** Remove every `{...}` block whose header matches `headerRe`, returning the rest. */
function removeBlocks(css, headerRe) {
  let out = '';
  let i = 0;
  const re = new RegExp(headerRe.source, 'g');
  let m;
  while ((m = re.exec(css))) {
    out += css.slice(i, m.index);
    const { end } = balancedBody(css, m.index);
    i = end;
    re.lastIndex = end;
  }
  return out + css.slice(i);
}

/** Concatenate the bodies of every `{...}` block whose header matches `headerRe`. */
function collectBlockBodies(css, headerRe) {
  const bodies = [];
  const re = new RegExp(headerRe.source, 'g');
  let m;
  while ((m = re.exec(css))) {
    const { body, end } = balancedBody(css, m.index);
    bodies.push(body);
    re.lastIndex = end;
  }
  return bodies.join('\n');
}

/** { '--name': 'value', ... } for every custom-property declaration in `css`. */
function collectDecls(css) {
  const decls = {};
  const re = /(--[\w-]+)\s*:\s*([^;{}]+);/g;
  let m;
  while ((m = re.exec(css))) decls[m[1]] = m[2].replace(/\s+/g, ' ').trim();
  return decls;
}

/** Strip accessibility-only overrides we don't consume on the web. */
function stripA11y(css) {
  return removeBlocks(css, /@media\s*\((?:prefers-contrast|forced-colors)\)/);
}

const MOZ_PREF = /@media\s+-moz-pref\("browser\.nova\.enabled"\)/;

/** Split `light-dark(a, b)` at the top-level comma; null if not a light-dark() value. */
function parseLightDark(value) {
  if (!value.startsWith('light-dark(') || !value.endsWith(')')) return null;
  const inner = value.slice('light-dark('.length, -1);
  let depth = 0;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (c === ',' && depth === 0) {
      return { light: inner.slice(0, i).trim(), dark: inner.slice(i + 1).trim() };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// read + partition the vendored Nova CSS
// ---------------------------------------------------------------------------

function readNova(name) {
  const p = join(NOVA_SRC, name);
  if (!existsSync(p)) {
    throw new Error(
      `Missing Nova source ${p}. Vendor it (see src/vendor/README.md) or set NOVA_SRC.`
    );
  }
  return readFileSync(p, 'utf8');
}

const shared = readNova('tokens-shared.css');
const brand = readNova('tokens-brand.css');
const combined = `${shared}\n${brand}`;

// Nova-mode overrides live inside @media -moz-pref(...); everything else is the base.
const novaOverrides = collectDecls(stripA11y(collectBlockBodies(combined, MOZ_PREF)));
const base = collectDecls(stripA11y(removeBlocks(combined, MOZ_PREF)));
const novaValue = (name) => novaOverrides[name] ?? base[name];

// ---------------------------------------------------------------------------
// build the four scopes
// ---------------------------------------------------------------------------

const rootLegacy = {};
const darkLegacy = {};
const rootNova = {};
const darkNova = {};
const missing = [];
const unresolved = [];

// LEGACY primitives (today's palette) — light only; dark inherits unless overridden below.
Object.assign(rootLegacy, legacyPrimitiveVars());

// LEGACY semantics (seeded to today's look).
for (const [name, { light, dark }] of Object.entries(LEGACY_SEMANTICS)) {
  rootLegacy[name] = light;
  if (dark != null) darkLegacy[name] = dark;
}

/** Emit one token into the Nova scopes, rewriting light-dark() to class scopes. */
function emitNova(name, value) {
  const ld = parseLightDark(value);
  if (ld) {
    rootNova[name] = ld.light;
    darkNova[name] = ld.dark;
  } else {
    rootNova[name] = value;
  }
}

// NOVA base: FxA-named primitives fall back to today's hex so no color utility
// breaks under the flag; grey is then remapped onto Nova's gray ramp.
// TODO(design): remap the non-neutral hues (red/blue/…) too — see token-map.mjs.
Object.assign(rootNova, legacyPrimitiveVars());
Object.assign(rootNova, PRIMITIVE_ALIASES_NOVA);

// NOVA: allowlisted semantic / scale tokens, light-dark rewritten.
for (const name of SEMANTIC_ALLOWLIST) {
  const value = novaValue(name);
  if (value == null) {
    missing.push(name);
    continue;
  }
  emitNova(name, value);
}

// Transitively pull in every Nova primitive the emitted values reference
// (fine gray shades, oklch hue ramps, --dimension-*, --box-shadow-color-*, …)
// so there are no dangling var() references.
const novaAll = {};
for (const n of new Set([...Object.keys(base), ...Object.keys(novaOverrides)])) {
  novaAll[n] = novaValue(n);
}
const refsOf = (value) =>
  [...value.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]);
const seen = new Set([...Object.keys(rootNova), ...Object.keys(darkNova)]);
let frontier = [...seen];
while (frontier.length) {
  const refs = new Set(
    frontier
      .flatMap((n) => [rootNova[n], darkNova[n]])
      .filter(Boolean)
      .flatMap(refsOf)
  );
  const next = [];
  for (const ref of refs) {
    if (seen.has(ref)) continue;
    seen.add(ref);
    if (novaAll[ref] == null) {
      unresolved.push(ref);
      continue;
    }
    emitNova(ref, novaAll[ref]);
    next.push(ref);
  }
  frontier = next;
}

// ---------------------------------------------------------------------------
// emit
// ---------------------------------------------------------------------------

function block(selector, decls) {
  const lines = Object.entries(decls).map(([k, v]) => `  ${k}: ${v};`);
  return `${selector} {\n${lines.join('\n')}\n}`;
}

let source = 'unknown';
const sourcePin = join(NOVA_SRC, 'SOURCE');
if (existsSync(sourcePin)) source = readFileSync(sourcePin, 'utf8').trim();

const header = `/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* GENERATED by libs/shared/design-tokens/src/generate.mjs — DO NOT EDIT.
 * Nova source: ${source}
 * Regenerate: nx run shared-design-tokens:generate
 *
 * Layers: :root / .dark = legacy (flag off, seeded to current values);
 *         [data-theme="nova"] = Nova (flag on). Toggle via data-theme on <html>. */`;

const css = [
  header,
  '/* ============================ LEGACY (flag off) ============================ */',
  block(':root', rootLegacy),
  block('.dark', darkLegacy),
  '/* ============================ NOVA (flag on) ============================== */',
  block(':root[data-theme="nova"]', rootNova),
  block('[data-theme="nova"].dark', darkNova),
  '',
].join('\n\n');

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, css);

console.log(`Wrote ${OUT}`);
console.log(
  `  legacy: ${Object.keys(rootLegacy).length} root / ${Object.keys(darkLegacy).length} dark`
);
console.log(
  `  nova:   ${Object.keys(rootNova).length} root / ${Object.keys(darkNova).length} dark`
);
if (missing.length) {
  console.warn(`  WARNING: ${missing.length} allowlisted token(s) not found in Nova source:`);
  for (const m of missing) console.warn(`    - ${m}`);
}
if (unresolved.length) {
  console.warn(`  WARNING: ${unresolved.length} referenced var(s) undefined in Nova source (dangling):`);
  for (const u of unresolved) console.warn(`    - ${u}`);
}
