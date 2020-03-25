/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const exec = require('child_process').exec;
const path = require('path');

const Joi = require('joi');

const version = require('../../package.json').version;
let commitHash, source;

// See if config/version.json exists (part of rpm builds)
try {
  const info = require('../../config/version.json');
  commitHash = info.version.hash;
  source = info.version.source;
} catch (e) {
  /* ignore */
}

module.exports = {
  response: {
    schema: {
      version: Joi.string().required(),
      commit: Joi.string().required(),
      source: Joi.string().required(),
    },
  },
  handler: async function index(req, h) {
    function sendReply() {
      return h
        .response({
          version: version,
          commit: commitHash,
          source: source,
        })
        .spaces(2)
        .suffix('\n');
    }

    if (commitHash) {
      return sendReply();
    }

    function getVersion() {
      return new Promise(resolve => {
        // figure it out from .git
        const gitDir = path.resolve(__dirname, '..', '..', '..', '..', '.git');
        // eslint-disable-next-line handle-callback-err
        exec('git rev-parse HEAD', { cwd: gitDir }, (err, stdout) => {
          commitHash = stdout.replace(/\s+/, '') || 'N/A';
          const configPath = path.join(gitDir, 'config');
          const cmd = 'git config --get remote.origin.url';
          const env = Object.assign({}, process.env, {
            GIT_CONFIG: configPath,
          });
          // eslint-disable-next-line handle-callback-err
          exec(cmd, { env }, (err, stdout) => {
            source = stdout.replace(/\s+/, '') || 'N/A';
            resolve();
          });
        });
      });
    }

    await getVersion();
    return sendReply();
  },
};
