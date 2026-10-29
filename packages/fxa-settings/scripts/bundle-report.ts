/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Prints the raw and Brotli JS size of each lazy route, from the webpack
// stats.json, and warns when a route is over its budget in bundle-budget.json.
// Usage, from packages/fxa-settings:
// node -r ts-node/register/transpile-only scripts/bundle-report.ts [buildDir]

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import budgetJson from './bundle-budget.json';

type ChunkId = number | string;

interface StatsModule {
  name: string;
  modules?: StatsModule[];
}

interface StatsChunk {
  id: ChunkId;
  files: string[];
  origins?: { request?: string }[];
  modules?: StatsModule[];
}

export interface Stats {
  entrypoints: Record<string, { chunks: ChunkId[] }>;
  chunks: StatsChunk[];
}

export interface FileSize {
  raw: number;
  br: number;
}

export interface RouteSize {
  route: string;
  rawBytes: number;
  brBytes: number;
  loadsNodeJose: boolean;
  found: boolean;
}

// Route name to Brotli budget in KB.
export type Budget = Record<string, number>;

// Route name to the request string of its lazy import in App/index.tsx.
const ROUTES: Record<string, string> = {
  Index: '../../pages/Index/container',
  Signin: '../../pages/Signin/container',
  Signup: '../../pages/Signup/container',
  Authorization: '../../pages/Authorization/container',
  ConfirmSignupCode: '../../pages/Signup/ConfirmSignupCode/container',
};

const BUDGET_TOLERANCE = 0.05;
const NODE_JOSE = /node_modules\/node-jose\//;

// A concatenated module holds its parts in a nested modules array.
function flattenModules(modules: StatsModule[] = []): StatsModule[] {
  return modules.flatMap((m) => [m, ...flattenModules(m.modules)]);
}

export function routeReport(
  stats: Stats,
  sizeOfFile: (file: string) => FileSize
): RouteSize[] {
  const chunksById = new Map(stats.chunks.map((c) => [c.id, c]));
  const entryChunks = Object.values(stats.entrypoints)[0].chunks;

  const groups = new Map<string, Set<ChunkId>>();
  for (const chunk of stats.chunks) {
    for (const origin of chunk.origins || []) {
      if (!origin.request) continue;
      const group = groups.get(origin.request) ?? new Set<ChunkId>();
      groups.set(origin.request, group.add(chunk.id));
    }
  }

  return Object.entries(ROUTES).map(([route, request]) => {
    const group = groups.get(request);
    if (!group) {
      return {
        route,
        rawBytes: 0,
        brBytes: 0,
        loadsNodeJose: false,
        found: false,
      };
    }
    let rawBytes = 0;
    let brBytes = 0;
    let loadsNodeJose = false;
    for (const id of new Set([...entryChunks, ...group])) {
      const chunk = chunksById.get(id)!;
      for (const file of chunk.files.filter((f) => f.endsWith('.js'))) {
        const size = sizeOfFile(file);
        rawBytes += size.raw;
        brBytes += size.br;
      }
      loadsNodeJose ||= flattenModules(chunk.modules).some((m) =>
        NODE_JOSE.test(m.name)
      );
    }
    return { route, rawBytes, brBytes, loadsNodeJose, found: true };
  });
}

export function budgetWarnings(report: RouteSize[], budget: Budget): string[] {
  const warnings: string[] = [];
  for (const { route, brBytes, found } of report) {
    if (!found) {
      warnings.push(`${route}: no chunk group found for it`);
      continue;
    }
    if (!(route in budget)) continue;
    const kb = brBytes / 1024;
    if (kb > budget[route] * (1 + BUDGET_TOLERANCE)) {
      const over = ((kb / budget[route] - 1) * 100).toFixed(1);
      warnings.push(
        `${route}: ${kb.toFixed(1)} KB Brotli is ${over}% over the budget of ${budget[route]} KB`
      );
    }
  }
  return warnings;
}

function main() {
  const buildDir = process.argv[2] || 'build/prod';
  const statsPath = path.join(buildDir, 'stats.json');
  if (!fs.existsSync(statsPath)) {
    console.error(
      `${statsPath} not found. Run BUILD_TARGETS=prod yarn build-react-prod first.`
    );
    process.exit(1);
  }
  const stats: Stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));

  const cache = new Map<string, FileSize>();
  const sizeOfFile = (file: string): FileSize => {
    const cached = cache.get(file);
    if (cached) return cached;
    const buf = fs.readFileSync(path.join(buildDir, file));
    const br = zlib.brotliCompressSync(buf, {
      params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 },
    });
    const size = { raw: buf.length, br: br.length };
    cache.set(file, size);
    return size;
  };

  const report = routeReport(stats, sizeOfFile);
  for (const { route, rawBytes, brBytes, loadsNodeJose, found } of report) {
    console.log(
      found
        ? `${route}: ${(rawBytes / 1024).toFixed(1)} KB raw, ${(brBytes / 1024).toFixed(1)} KB Brotli${loadsNodeJose ? ', loads node-jose' : ''}`
        : `${route}: no chunk group found for it`
    );
  }
  const jose = report.filter((r) => r.loadsNodeJose).map((r) => r.route);
  console.log(`Routes that load node-jose: ${jose.join(', ') || 'none'}`);
  for (const warning of budgetWarnings(report, budgetJson)) {
    console.log(`WARN ${warning}`);
  }
}

if (require.main === module) {
  main();
}
