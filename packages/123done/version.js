/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Return version info based on package.json, the git sha, and source repo
 *
 * Try to statically determine commitHash and sourceRepo at startup.
 *
 * If commitHash cannot be found from ./version.json (i.e., this is not
 * production or stage), then an attempt will be made to determine commitHash
 * and sourceRepo dynamically from `git`. If it cannot be found with `git`,
 * just show UNKNOWN for commitHash and sourceRepo.
 */

'use strict';

const cp = require('child_process');
const path = require('path');
const pckg = require('./package.json');

const UNKNOWN = 'unknown';
const versionJsonPath = './version.json';
const gitDir = path.resolve(__dirname, '..', '..', '.git');

function getCommitHash() {
  let stdout = UNKNOWN;

  try {
    const { version } = require(versionJsonPath);
    return version.hash;
  } catch (e) {
    /* Ignore, shell out to `git` for hash */
  }

  try {
    stdout = cp.execSync('git rev-parse HEAD', { cwd: gitDir });
  } catch (e) {
    /* Ignore, report UNKNOWN */
  }

  return stdout && stdout.toString().trim();
}

function getSourceRepo() {
  let stdout = UNKNOWN;

  try {
    const { version } = require(versionJsonPath);
    return version.source;
  } catch (e) {
    /* Ignore, shell out to `git` for repo */
  }

  const configPath = path.join(gitDir, 'config');
  const cmd = 'git config --get remote.origin.url';

  try {
    stdout = cp.execSync(cmd, cmd, { env: { GIT_CONFIG: configPath } });
  } catch (e) {
    /* Ignore, shell out to `git` for repo */
  }

  return stdout && stdout.toString().trim();
}

let version = null;
function getVersionInfo() {
  if (!version) {
    // Only fetch version info if it
    // has not already been fetched.
    version = {
      version: pckg.version,
      commit: getCommitHash(),
      source: getSourceRepo(),
    };
  }

  return version;
}

getVersionInfo();

module.exports = version;
