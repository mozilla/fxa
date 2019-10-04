#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*

 Usage:
 scripts/retire-new-signing-key.js

 Will zero out the old signing key in ./config/oldKey.json.

 */

//eslint-disable no-console

const fs = require('fs');
const config = require('../config');

// We don't use this, but we load it to check key config.
require('../lib/oauth/keys');

function main(cb) {
  cb = cb || (() => {});

  const oldKeyPath = config.get('oauthServer.openid.oldKeyFile');
  fs.unlinkSync(oldKeyPath);
  console.log('OldKey wiped:', oldKeyPath);

  console.log(
    'Please restart the server to stop advertising the old signing key'
  );
  return cb();
}

module.exports = main;

if (require.main === module) {
  main();
}
