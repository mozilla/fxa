/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  routeReport,
  budgetWarnings,
  FileSize,
  RouteSize,
  Stats,
} from './bundle-report';

const SIZES: Record<string, FileSize> = {
  'main.js': { raw: 1000, br: 100 },
  'main.css': { raw: 500, br: 50 },
  'main.js.map': { raw: 9000, br: 900 },
  'index.js': { raw: 200, br: 20 },
  'signin.js': { raw: 300, br: 30 },
  'shared.js': { raw: 4000, br: 400 },
  'signup.js': { raw: 600, br: 60 },
  'auth.js': { raw: 700, br: 70 },
};
const sizeOfFile = (file: string) => SIZES[file];

const origin = (request: string) => ({ request });

const stats: Stats = {
  entrypoints: { main: { chunks: [0] } },
  chunks: [
    {
      id: 0,
      files: ['main.js', 'main.css', 'main.js.map'],
      origins: [{}, origin('../../pages/Signup/container')],
      modules: [{ name: './src/index.tsx' }],
    },
    {
      id: 1,
      files: ['index.js'],
      origins: [origin('../../pages/Index/container')],
      modules: [],
    },
    {
      id: 2,
      files: ['signin.js'],
      origins: [origin('../../pages/Signin/container')],
      modules: [],
    },
    {
      id: 3,
      files: ['shared.js'],
      origins: [
        origin('../../pages/Index/container'),
        origin('../../pages/Signin/container'),
      ],
      modules: [
        {
          name: './src/lib/crypto.ts + 2 modules',
          modules: [{ name: './node_modules/node-jose/lib/jwk/rsakey.js' }],
        },
      ],
    },
    {
      id: 4,
      files: ['signup.js'],
      origins: [origin('../../pages/Signup/container')],
      modules: [],
    },
    {
      id: 5,
      files: ['auth.js'],
      origins: [origin('../../pages/Authorization/container')],
      modules: [],
    },
  ],
};

describe('routeReport', () => {
  const byRoute = Object.fromEntries(
    routeReport(stats, sizeOfFile).map((r) => [r.route, r])
  );

  it('counts the entry chunks plus the route chunk group, once per route', () => {
    assert.deepStrictEqual(byRoute.Index, {
      route: 'Index',
      rawBytes: 5200,
      brBytes: 520,
      loadsNodeJose: true,
      found: true,
    });
    assert.deepStrictEqual(byRoute.Signin, {
      route: 'Signin',
      rawBytes: 5300,
      brBytes: 530,
      loadsNodeJose: true,
      found: true,
    });
  });

  it('counts an entry chunk that is also in the route group once', () => {
    assert.deepStrictEqual(byRoute.Signup, {
      route: 'Signup',
      rawBytes: 1600,
      brBytes: 160,
      loadsNodeJose: false,
      found: true,
    });
  });

  it('counts only .js files', () => {
    assert.strictEqual(byRoute.Authorization.rawBytes, 1700);
    assert.strictEqual(byRoute.Authorization.brBytes, 170);
  });

  it('marks a route with no chunk group as not found', () => {
    assert.deepStrictEqual(byRoute.ConfirmSignupCode, {
      route: 'ConfirmSignupCode',
      rawBytes: 0,
      brBytes: 0,
      loadsNodeJose: false,
      found: false,
    });
  });
});

describe('budgetWarnings', () => {
  const entry = (route: string, brBytes: number): RouteSize => ({
    route,
    rawBytes: brBytes,
    brBytes,
    loadsNodeJose: false,
    found: true,
  });
  const budget = { Index: 100, Signin: 100 };

  it('warns only above 5% over the budget', () => {
    const warnings = budgetWarnings(
      [entry('Index', 105 * 1024), entry('Signin', 105 * 1024 + 1)],
      budget
    );
    assert.deepStrictEqual(warnings, [
      'Signin: 105.0 KB Brotli is 5.0% over the budget of 100 KB',
    ]);
  });

  it('skips the budget check for a route without a budget entry', () => {
    const warnings = budgetWarnings(
      [
        entry('Authorization', 10000 * 1024),
        entry('ConfirmSignupCode', 10000 * 1024),
      ],
      budget
    );
    assert.deepStrictEqual(warnings, []);
  });

  it('warns for a route with no chunk group', () => {
    const report = routeReport(stats, sizeOfFile);
    assert.deepStrictEqual(budgetWarnings(report, budget), [
      'ConfirmSignupCode: no chunk group found for it',
    ]);
  });
});
