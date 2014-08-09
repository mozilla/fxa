/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const util = require('util');

const version = require('../../package.json').version;

// See if config/version.json exists (part of rpm builds)
var commitHash = (function() {
  var sha;
  try {
    sha = require('../../config/version.json');
    sha = sha.version.hash;
  } catch(e) { /* ignore */ }
  return sha;
})();

module.exports = {
  handler: function index(req, reply) {
    function sendReply() {
      reply({
        version: version,
        commit: commitHash,
      }).spaces(2);
    }

    if (commitHash) {
      return sendReply();
    }

    // figure it out from git (either '.git', or '/home/app/git' for AwsBox)
    var gitDir = path.resolve(__dirname, '..', '..', '.git');
    if (!fs.existsSync(gitDir)) {
      // try at '/home/app/git' for AwsBox deploys
      gitDir = path.sep + path.join('home', 'app', 'git');
    }
    var cmd = util.format('git --git-dir=%s rev-parse HEAD', gitDir);
    exec(cmd, function(err, stdout) {
      commitHash = stdout.replace(/\s+/, '');
      return sendReply();
    });
  }
};
