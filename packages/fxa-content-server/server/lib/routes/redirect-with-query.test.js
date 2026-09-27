/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = require('node:assert');
const redirectWithQuery = require('./redirect-with-query');

function redirectTarget(route, originalUrl) {
  let target;
  route.process({ originalUrl }, { redirect: (url) => (target = url) });
  return target;
}

describe('redirect-with-query', () => {
  it('redirects /verify_email to /confirm_signup_code with the query string', () => {
    const route = redirectWithQuery('verify_email', 'confirm_signup_code');
    assert.strictEqual(route.method, 'get');
    assert.strictEqual(route.path, '/verify_email');
    assert.strictEqual(
      redirectTarget(
        route,
        '/verify_email?uid=abc&code=def&flowId=123&flowBeginTime=456'
      ),
      '/confirm_signup_code?uid=abc&code=def&flowId=123&flowBeginTime=456'
    );
  });

  it('redirects /verify_primary_email to /settings with the query string', () => {
    const route = redirectWithQuery('verify_primary_email', 'settings');
    assert.strictEqual(route.path, '/verify_primary_email');
    assert.strictEqual(
      redirectTarget(route, '/verify_primary_email?uid=abc&deviceId=789'),
      '/settings?uid=abc&deviceId=789'
    );
  });

  it('redirects without a query string', () => {
    const route = redirectWithQuery('verify_email', 'confirm_signup_code');
    assert.strictEqual(
      redirectTarget(route, '/verify_email'),
      '/confirm_signup_code'
    );
  });
});
