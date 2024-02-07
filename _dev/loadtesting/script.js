/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Load testing script for the FxA Auth Server.
 *
 * 1. Ensure `k6` is installed. [official k6 installation guide](https://k6.io/docs/getting-started/installation/)
 * 3. Execute the script with the command: `k6 run script.js`.
 *
 */
import http from 'k6/http';

export const options = {
  // A number specifying the number of VUs to run concurrently.
  vus: 10,
  // A string specifying the total duration of the test run.
  duration: '30s',
};

export default function() {
  const url = 'http://127.0.0.1:9000/v1/account/status';
  // const url = 'https://api-accounts.stage.mozaws.net/v1/account/status';
  const payload = JSON.stringify({
    'email': 'a@aa.com',
    'thirdPartyAuthStatus': true,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  http.post(url, payload, params);
}
