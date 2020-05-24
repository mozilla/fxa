#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var cp = require('child_process');
var util = require('util');

// Generate legacy-format output that looks something like:
//
// {
//   "version": {
//     "hash": "88f6f24e53da56faa933c357bffb61cbeaec7ff3",
//     "subject": "Merge pull request #2939 from vladikoff/sentry-patch3",
//     "committer date": "1439472293",
//     "source": "git://github.com/mozilla/fxa-content-server.git"
//   }
// }
//
// This content is placed in the stage/prod rpm at `./config/version.json`.
// Ignore errors and always produce a (possibly empty struct) output.

var args = '{"hash":"%H","subject":"%s","committer date":"%ct"}';
var cmd = util.format("git --no-pager log --format=format:'%s' -1", args);
cp.exec(cmd, function (err, stdout) {
  var info = {
    version: JSON.parse(stdout || '{}'),
  };

  var cmd = 'git config --get remote.origin.url';
  cp.exec(cmd, function (err, stdout) {
    info.version.source = (stdout && stdout.trim()) || '';
    console.log(JSON.stringify(info, null, 2)); //eslint-disable-line no-console
  });
});
