import assert from 'assert';
import fs from 'fs';
import path from 'path';

// Guard for the FXA-9392 / ADR-0022 Bearer migration: the Hawk signing code
// (hawk.header / hawkHeader / calculateMac) was removed from fxa-auth-client
// in M2. This test fails if anything reintroduces it. Type-level enforcement
// already blocks direct imports, but a string-level check is belt-and-
// suspenders for re-exports, string builders, or vendored copies.

const BANNED = /hawk\.header\(|\bhawkHeader\(|\bcalculateMac\(/;
// path.resolve() against CWD instead of __dirname so the file works whether
// loaded as CJS (ts-node/register) or ESM (Node's native loader). Mocha is
// invoked from the package root via `mocha test/*` so CWD is stable.
const ROOTS = [
  path.resolve('lib'),
  path.resolve('server.ts'),
  path.resolve('browser.ts'),
];

function* walk(p: string): Generator<string> {
  const stat = fs.statSync(p);
  if (stat.isFile()) {
    yield p;
    return;
  }
  for (const entry of fs.readdirSync(p, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    yield* walk(path.join(p, entry.name));
  }
}

describe('no-hawk-signing guard', () => {
  it('fxa-auth-client source is free of Hawk signing calls', () => {
    const offenders: string[] = [];
    for (const root of ROOTS) {
      assert.ok(
        fs.existsSync(root),
        `Expected root ${root} not found — run from package root`
      );
      for (const file of walk(root)) {
        if (!/\.(ts|js)$/.test(file)) continue;
        const text = fs.readFileSync(file, 'utf8');
        if (BANNED.test(text)) {
          offenders.push(file);
        }
      }
    }
    assert.deepEqual(
      offenders,
      [],
      `Hawk signing reintroduced in:\n  ${offenders.join('\n  ')}`
    );
  });
});
