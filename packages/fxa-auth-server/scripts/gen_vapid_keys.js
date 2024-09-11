/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* scripts/gen_valid_keys.js creates public and private keys suitable for
   use with VAPID in push notifications.

   Usage:
   ./scripts/gen_valid_keys.js [filename]

   The filename will default to:

       ./config/vapid-keys.json

   If this file already exists, this script will show an error message
   and exit. You must remove the file if you want to generate a new
   keypair.
*/

'use strict';

import fs from 'fs';
import webpush from 'web-push';

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'dev';
}

import { config } from '../config';
const vapidKeysFile = config.get('vapidKeysFile');

const fileExists = fs.existsSync(vapidKeysFile);
if (fileExists) {
  console.log('keys file already exists');
  return;
  // process.exit();
}

console.error('Generating key for VAPID');

const keys = webpush.generateVAPIDKeys();
fs.writeFileSync(
  vapidKeysFile,
  JSON.stringify({
    privateKey: keys.privateKey.toString('base64'),
    publicKey: keys.publicKey.toString('base64'),
  })
);

console.error('Done:', vapidKeysFile);
