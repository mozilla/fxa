/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * Return version info based on package.json, the git sha, and source repo
 *
 * Try to statically determine commitHash and sourceRepo at startup.
 *
 * If commitHash cannot be found from `version.json` (i.e., this is not
 * production or stage), then an attempt will be made to determine commitHash
 * and sourceRepo dynamically from `git`. If it cannot be found with `git`,
 * just show 'unknown' for commitHash and sourceRepo.
 *
 * This module may be called as ./dist/lib/version.js, or when testing,
 * ./lib/version.ts so we need to look for `package.json` and `version.json`
 * in two possible locations.
 */

import * as cp from 'child_process';
import * as path from 'path';

function readJson(filepath: string) {
  try {
    return require(filepath);
  } catch (e) {
    /* ignore */
  }

  return;
}

function getValue(name: string, command: string): string {
  const value =
    readJson(path.resolve(__dirname, '..', '..', 'version.json')) ||
    readJson(path.resolve(__dirname, '..', '..', '..', 'version.json'));

  if (value && value.version) {
    return value.version[name];
  }

  let stdout = 'unknown';
  try {
    stdout = cp.execSync(command, { cwd: __dirname }).toString('utf8');
  } catch (e) {
    /* ignore */
  }

  return stdout && stdout.toString().trim();
}

function getVersionInfo(): object {
  const commit = getValue('hash', 'git rev-parse HEAD');
  const source = getValue('source', 'git config --get remote.origin.url');

  const packageInfo =
    readJson(path.resolve(__dirname, '..', '..', 'package.json')) ||
    readJson(path.resolve(__dirname, '..', '..', '..', 'package.json'));

  if (packageInfo) {
    return {
      commit,
      source,
      version: packageInfo.version
    };
  }

  return {};
}

export const version = getVersionInfo();
