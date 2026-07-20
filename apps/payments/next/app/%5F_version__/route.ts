/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// force-dynamic uses Node.js runtime (not edge), so fs and child_process are available.
export const dynamic = 'force-dynamic';

// Version-reading logic is intentionally self-contained per app (not shared)
// payments-api and payments-next are deployed as separate containers.
const UNKNOWN = 'unknown';
// build.sh patches package.json with the git tag version, matching version.json.
const version = require('../../package.json').version;

let commitHash = UNKNOWN;
let sourceRepo = UNKNOWN;
let l10n: string | undefined;

try {
  const versionJsonPath = path.join(process.cwd(), 'config', 'version.json');
  const info = JSON.parse(fs.readFileSync(versionJsonPath, 'utf-8'));
  commitHash = info.version.hash;
  sourceRepo = info.version.source;
} catch {
  /* ignore, fall back to git */
}

if (commitHash === UNKNOWN) {
  try {
    commitHash = cp.execSync('git rev-parse HEAD').toString().trim();
  } catch {
    commitHash = UNKNOWN;
  }
}

if (sourceRepo === UNKNOWN) {
  try {
    sourceRepo = cp
      .execSync('git config --get remote.origin.url')
      .toString()
      .trim();
  } catch {
    sourceRepo = UNKNOWN;
  }
}

try {
  l10n = fs
    .readFileSync(
      path.join(process.cwd(), 'public', 'locales', 'git-head.txt'),
      'utf-8'
    )
    .trim();
} catch {
  /* git-head.txt doesn't exist in dev */
}

export async function GET() {
  return NextResponse.json({
    commit: commitHash,
    version,
    ...(l10n ? { l10n } : {}),
    source: sourceRepo,
  });
}
