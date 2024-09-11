/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*

 Usage:
 scripts/prepare-new-signing-key.js

 Will generate a new signing key and write it into ./config/newKey.json.

 */

//eslint-disable no-console

import fs from 'fs';

import assert from 'assert';
import keys from '../lib/oauth/keys';
import { config } from '../config';

function main(cb) {
  cb = cb || (() => {});

  const newKeyPath = config.get('oauthServer.openid.newKeyFile');
  if (!newKeyPath) {
    assert(false, 'openid.newKeyFile not specified');
  }

  if (config.get('oauthServer.openid.newKey')) {
    assert(false, 'new key already exists; perhaps you meant to activate it?');
  }

  const privKey = keys.generatePrivateKey();
  fs.writeFileSync(newKeyPath, JSON.stringify(privKey, undefined, 2));
  console.log('NewKey saved:', newKeyPath);

  console.log(
    'Please restart the server to begin advertising the incoming signing key'
  );
  return cb();
}

export default main;

if (require.main === module) {
  main();
}
