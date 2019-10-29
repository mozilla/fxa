/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crypto = require('crypto');

const config = require('../../config');

function unique(length) {
  return crypto.randomBytes(length); // eslint-disable-line fxa/async-crypto-random
}

function fn(configName) {
  return function udid() {
    return unique(config.get('oauthServer.unique.' + configName));
  };
}

unique.id = fn('id');
unique.developerId = fn('developerId');
unique.secret = fn('clientSecret');
unique.code = fn('code');
unique.token = fn('token');

module.exports = unique;
