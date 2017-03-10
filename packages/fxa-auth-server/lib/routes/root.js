/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const exec = require('child_process').exec;
const path = require('path');

const version = require('../../package.json').version;
var commitHash, source;

// See if config/version.json exists (part of rpm builds)
try {
  var info = require('../../config/version.json');
  commitHash = info.version.hash;
  source = info.version.source;
} catch(e) {
  /* ignore */
}

module.exports = {
  handler: function index(req, reply) {
    function sendReply() {
      reply({
        version: version,
        commit: commitHash,
        source: source
      }).spaces(2).suffix('\n');
    }

    if (commitHash) {
      return sendReply();
    }

    // figure it out from .git
    var gitDir = path.resolve(__dirname, '..', '..', '.git');
    exec('git rev-parse HEAD', { cwd: gitDir }, function(err, stdout) {
      commitHash = stdout.replace(/\s+/, '');
      var configPath = path.join(gitDir, 'config');
      var cmd = 'git config --get remote.origin.url';
      exec(cmd, { env: { GIT_CONFIG: configPath } }, function(err, stdout) {
        source = stdout.replace(/\s+/, '');
        return sendReply();
      });
    });
  }
};
