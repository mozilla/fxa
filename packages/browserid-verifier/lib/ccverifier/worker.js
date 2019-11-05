/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const LocalVerifier = require('browserid-local-verify');

var verifier = new LocalVerifier();

process.on('message', function(message) {
  if (! message.args) {
    message.args = {};
  }
  try {
    verifier.verify(message.args, function(err, res) {
      if (err) {
        return process.send({ err: err });
      }
      return process.send({ res: res });
    });
  } catch (err) {
    return process.send({ err: err });
  }
});

process.on('uncaughtException', function() {
  process.exit(8);
});
