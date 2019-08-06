/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Return version info based on package.json, the git sha, and source repo
 *
 * Try to statically determine commitHash, sourceRepo, l10nVersion, and
 * tosPpVersion at startup.
 *
 * If l10nVersion and tosPpVersion cannot be loaded statically from the
 * content in ../../node_modules, then just show UNKNOWN.
 *
 * If commitHash cannot be found from ./config/version.json (i.e., this is not
 * production or stage), then an attempt will be made to determine commitHash
 * and sourceRepo dynamically from `git`. If it cannot be found with `git`,
 * just show UNKNOWN for commitHash and sourceRepo.
 *
 */

'use strict';

// TODO - Make this shared code

const cp = require('child_process');
const path = require('path');

const UNKNOWN = 'unknown';

const versionJsonPath = '../../config/version.json';

// commitHash and sourceRepo
function getCommitHash() {
  try {
    const versionInfo = require(versionJsonPath);
    const ver = versionInfo.version;
    return ver.hash;
  } catch (e) {
    /* ignore, shell out to `git` for hash */
  }

  let stdout = UNKNOWN;
  const gitDir = path.resolve(__dirname, '../../../../.git');

  try {
    stdout = cp.execSync('git rev-parse HEAD', { cwd: gitDir });
  } catch (e) {
    /* ignore, report UNKNOWN */
  }

  return stdout && stdout.toString().trim();
}

function getSourceRepo() {
  try {
    const versionInfo = require(versionJsonPath);
    const ver = versionInfo.version;
    return ver.source;
  } catch (e) {
    /* ignore, shell out to `git` for repo */
  }

  let stdout = UNKNOWN;
  const gitDir = path.resolve(__dirname, '..', '..', '.git');
  const configPath = path.join(gitDir, 'config');
  const cmd = 'git config --get remote.origin.url';

  try {
    stdout = cp.execSync(cmd, cmd, { env: { GIT_CONFIG: configPath } });
  } catch (e) {
    /* ignore, shell out to `git` for repo */
  }

  return stdout && stdout.toString().trim();
}

let version = null;
function getVersionInfo() {
  if (!version) {
    // only fetch version info if it has not already been fetched.
    /*eslint-disable sorting/sort-object-props*/
    version = {
      commit: getCommitHash(),
      version: require('../../package.json').version,
      source: getSourceRepo(),
    };
    /*eslint-disable sorting/sort-object-props*/
  }

  return version;
}

getVersionInfo();

module.exports = version;
