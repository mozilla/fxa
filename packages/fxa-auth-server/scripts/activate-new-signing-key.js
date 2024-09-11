/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*

 Usage:
 scripts/activate-new-signing-key.js

 Will copy the existing signing key from ./config/key.json into ./config/oldKey.json,
 then move the new signing key from ./config/newKey.json into ./config/key.json.

 */

//eslint-disable no-console

import fs from 'fs';

import assert from 'assert';
import keys from '../lib/oauth/keys';
import { config } from '../config';

function main(cb) {
  cb = cb || (() => {});

  const keyPath = config.get('oauthServer.openid.keyFile');
  const key = config.get('oauthServer.openid.key');

  const newKeyPath = config.get('oauthServer.openid.newKeyFile');
  const newKey = config.get('oauthServer.openid.newKey');
  assert(newKey, 'missing new signing key');

  const oldKeyPath = config.get('oauthServer.openid.oldKeyFile');
  const oldKey = keys.extractPublicKey(key);
  fs.writeFileSync(oldKeyPath, JSON.stringify(oldKey, undefined, 2));
  console.log('OldKey saved:', keyPath);

  fs.writeFileSync(keyPath, JSON.stringify(newKey, undefined, 2));
  console.log('Key saved:', keyPath);

  fs.unlinkSync(newKeyPath);
  console.log('NewKey wiped:', keyPath);

  console.log('Please restart the server to begin using the new signing key');
  return cb();
}

export default main;

if (require.main === module) {
  main();
}
