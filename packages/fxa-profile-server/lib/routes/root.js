/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const exec = require('child_process').exec;
const path = require('path');
const util = require('util');

const Joi = require('joi');

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
  response: {
    schema: {
      version: Joi.string().required(),
      commit: Joi.string().required(),
      source: Joi.string().required(),
    }
  },
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
    var cmd = util.format('git --git-dir=%s rev-parse HEAD', gitDir);
    exec(cmd, function(err, stdout) { // eslint-disable-line handle-callback-err
      commitHash = stdout.replace(/\s+/, '');
      var configPath = path.join(gitDir, 'config');
      var cmd = util.format('git config --file %s --get remote.origin.url', configPath);
      exec(cmd, function(err, stdout) { // eslint-disable-line handle-callback-err
        source = stdout.replace(/\s+/, '');
        return sendReply();
      });
    });
  }
};
