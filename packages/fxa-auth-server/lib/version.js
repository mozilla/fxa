/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const path = require('path');
const cp = require('child_process');
const promisify = require('util').promisify;

const version = require('../package.json').version;
let commitHash;
let sourceRepo;

const UNKNOWN = 'unknown';

const processExec = promisify(cp.exec);

// Production and stage provide './config/version.json'. Try to load this at
// startup; punt on failure. For dev environments, we'll get this from `git`
// for dev environments.
try {
  const versionJson = path.join(__dirname, '..', 'config', 'version.json');
  const info = require(versionJson);
  commitHash = info.version.hash;
  sourceRepo = info.version.source;
} catch (e) {
  /* ignore */
}

async function getVersion() {
  // If we already have the commitHash, return it
  if (commitHash) {
    return { version, commit: commitHash, source: sourceRepo };
  }

  // ignore errors and default to 'unknown' if not found
  const gitDir = path.resolve(__dirname, '..', '..', '..', '.git');

  const { stdout: stdout1, stderr: stderr1 } = await processExec(
    'git rev-parse HEAD',
    {
      cwd: gitDir,
    }
  );
  if (stderr1) {
    throw new Error(stderr1);
  }
  const configPath = path.join(gitDir, 'config');
  const cmd = 'git config --get remote.origin.url';

  const { stdout: stdout2, stderr: stderr2 } = await processExec(cmd, {
    env: { GIT_CONFIG: configPath, PATH: process.env.PATH },
  });
  if (stderr2) {
    throw new Error(stderr2);
  }
  commitHash = (stdout1 && stdout1.trim()) || UNKNOWN;
  sourceRepo = (stdout2 && stdout2.trim()) || UNKNOWN;
  return { version, commit: commitHash, source: sourceRepo };
}

module.exports = { getVersion };
