/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { PUBLIC_KEYS } = require('../keys');

module.exports = {
  handler: async function jwks() {
    return { keys: PUBLIC_KEYS };
  },
};
