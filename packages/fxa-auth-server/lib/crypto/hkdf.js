/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { hkdfSync } = require('crypto');
const { NAMESPACE } = require('../routes/utils/client-key-stretch');

function KWE(name, email) {
  return Buffer.from(`${NAMESPACE + name}:${email}`);
}

function KW(name) {
  return Buffer.from(NAMESPACE + name);
}

async function hkdf(km, info, salt, len) {
  // RFC 5869 uses HashLen zero bytes when the caller has no salt.
  const saltBuf = salt || Buffer.alloc(32);
  return Buffer.from(hkdfSync('sha256', km, saltBuf, KW(info), len));
}

hkdf.KW = KW;
hkdf.KWE = KWE;

module.exports = hkdf;
