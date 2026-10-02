/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as esbuild from 'esbuild';
import { cpSync, mkdirSync } from 'node:fs';

const serve = process.argv.includes('--serve');
const outdir = 'dist';

mkdirSync(outdir, { recursive: true });
cpSync('public', outdir, { recursive: true });

const ctx = await esbuild.context({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  format: 'esm',
  sourcemap: true,
  minify: !serve,
  outdir,
  logLevel: 'info',
});

if (serve) {
  await ctx.watch();
  // fallback makes /callback resolve to index.html for the OAuth redirect
  await ctx.serve({
    servedir: outdir,
    port: Number(process.env.PORT ?? 8090),
    fallback: `${outdir}/index.html`,
  });
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
