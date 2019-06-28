/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const got = require('got');
const serverUrl = intern._config.fxaContentRoot.replace(/\/$/, '');

registerSuite('routes/get-frontend-pairing', {
  tests: {
    'direct navigation to pairing routes redirects': function() {
      const PAIRING_ROUTES = [
        'pair/auth/allow',
        'pair/auth/complete',
        'pair/auth/wait_for_supp',
        'pair/supp/allow',
        'pair/supp/wait_for_auth',
      ];
      const requests = [];
      PAIRING_ROUTES.forEach(route => {
        requests.push(got(`${serverUrl}/${route}`, {}));
      });

      return Promise.all(requests).then(results => {
        results.forEach(res => {
          // 'got' follows the redirects to /pair/failure with 200 status code
          assert.equal(res.statusCode, 200);
          assert.equal(res.url, `${serverUrl}/pair/failure`);
        });
      });
    },
  },
});
