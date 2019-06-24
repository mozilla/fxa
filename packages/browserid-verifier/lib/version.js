/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path'),
  cp = require('child_process');

const UNKNOWN = 'unknown';

// For production builds, we write version into to a json
// file for easy reporting in /__version__ endpoint.
var commitHash;
var sourceRepo;
const version = require('../package.json').version;
try {
  var versionJson = path.join(__dirname, '..', 'version.json');
  var info = require(versionJson);
  commitHash = info.version.hash;
  sourceRepo = info.version.source;
} catch (e) {
  /* ignore */
}

module.exports = {
  getVersionInfo: function getVersionInfo(cb) {
    if (commitHash) {
      return cb({
        version: version,
        commit: commitHash,
        source: sourceRepo,
      });
    }
    // ignore errors and default to 'unknown' if not found
    var gitDir = path.resolve(__dirname, '..', '.git');
    cp.exec('git rev-parse HEAD', { cwd: gitDir }, function(err, stdout1) {
      var configPath = path.join(gitDir, 'config');
      var cmd = 'git config --get remote.origin.url';
      cp.exec(cmd, { env: { GIT_CONFIG: configPath } }, function(err, stdout2) {
        commitHash = (stdout1 && stdout1.trim()) || UNKNOWN;
        sourceRepo = (stdout2 && stdout2.trim()) || UNKNOWN;
        return cb({
          version: version,
          commit: commitHash,
          source: sourceRepo,
        });
      });
    });
  },
};
