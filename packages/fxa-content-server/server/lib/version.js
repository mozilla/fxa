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
const cp = require('child_process');
const fs = require('fs');
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

function getL10nVersion() {
  try {
    const gitShaPath = path.join(
      __dirname,
      '..',
      '..',
      'fxa-content-server-l10n',
      'git-head.txt'
    );
    return fs.readFileSync(gitShaPath, 'utf8').trim();
  } catch (e) {
    /* ignore */
  }
}

function getTosPpVersion() {
  try {
    const pkgPath = '../../node_modules/legal-docs/package.json';
    const pkgInfo = require(pkgPath);
    let gitHead = undefined;
    // npm < 5.8 has the git hash in `gitHead`
    if (pkgInfo && pkgInfo.gitHead) {
      gitHead = pkgInfo.gitHead;
    }

    // npm >= 5.8 has the git hash in `_resolved`
    if (! gitHead && pkgInfo && pkgInfo._resolved) {
      gitHead = pkgInfo._resolved.split('#')[1];
    }

    if (! gitHead) {
      gitHead = require('../../package-lock.json').dependencies[
        'legal-docs'
      ].version.split('#')[1];
    }

    return gitHead;
  } catch (e) {
    return UNKNOWN;
  }
}

let version = null;
function getVersionInfo() {
  if (! version) {
    // only fetch version info if it has not already been fetched.
    version = {
      commit: getCommitHash(),
      version: require('../../package.json').version,
      l10n: getL10nVersion(),
      tosPp: getTosPpVersion(),
      source: getSourceRepo(),
    };
  }

  return version;
}

getVersionInfo();

module.exports = version;
