/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import cp from 'child_process';
import fs from 'fs';
import path from 'path';

// Version-reading logic is intentionally self-contained per app (not shared)
// payments-api and payments-next are deployed as separate containers.
const UNKNOWN = 'unknown';

// build.sh patches package.json with the git tag version, matching version.json.
const version = require('../../package.json').version;
let commitHash = UNKNOWN;
let sourceRepo = UNKNOWN;

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

// No l10n field — payments-api is a pure backend API with no localization.
export interface VersionInfo {
  version: string;
  commit: string;
  source: string;
}

@Injectable()
export class AppService {
  __heartbeat__() {
    return {};
  }

  __lbheartbeat__() {
    return {};
  }

  __version__(): VersionInfo {
    return { commit: commitHash, version, source: sourceRepo };
  }
}
