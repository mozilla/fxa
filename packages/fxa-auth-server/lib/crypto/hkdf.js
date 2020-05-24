/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const HKDF = require('hkdf');
const P = require('../promise');

const NAMESPACE = 'identity.mozilla.com/picl/v1/';

function KWE(name, email) {
  return Buffer.from(`${NAMESPACE + name}:${email}`);
}

function KW(name) {
  return Buffer.from(NAMESPACE + name);
}

function hkdf(km, info, salt, len) {
  const d = P.defer();
  const df = new HKDF('sha256', salt, km);
  df.derive(KW(info), len, (key) => {
    d.resolve(key);
  });
  return d.promise;
}

hkdf.KW = KW;
hkdf.KWE = KWE;

module.exports = hkdf;
