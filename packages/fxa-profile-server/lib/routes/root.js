/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const util = require('util');

const config = require('../config');
const version = require('../../package.json').version;

var commitHash = config.get('git.commit');

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
    var gitDir;
    if (!fs.existsSync(path.join(__dirname, '..', '..', '.git'))) {
      // try at '/home/app/git' for AwsBox deploys
      gitDir = path.sep + path.join('home', 'app', 'git');
    }
    var cmd = util.format('git %s rev-parse HEAD',
        gitDir ? '--git-dir=' + gitDir : '');
    exec(cmd, function(err, stdout) {
      commitHash = stdout.replace(/\s+/, '');
      return sendReply();
    });
  }
};
