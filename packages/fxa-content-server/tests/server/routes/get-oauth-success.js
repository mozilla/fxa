/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const got = require('got');
const serverUrl = intern._config.fxaContentRoot.replace(/\/$/, '');

registerSuite('routes/get-oauth-success', {
  tests: {
    'resolves the success route': function () {
      return got(`${serverUrl}/oauth/success/dcdb5ae7add825d2`).then((res) => {
        assert.equal(res.statusCode, 200);
      });
    },
    'does not resolve with empty client': function () {
      return got(`${serverUrl}/oauth/success`).catch((err) => {
        assert.equal(err.statusCode, 404);
      });
    },
  },
});
