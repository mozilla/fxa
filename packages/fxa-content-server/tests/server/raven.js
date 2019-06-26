/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const raven = require('../../server/lib/raven');

var suite = {
  tests: {},
};

suite.tests['exports correctly'] = function() {
  assert.ok(raven.ravenModule);
  assert.ok(raven._middlewareConfig);
};

suite.tests['middlewareConfig'] = function() {
  var config = raven._middlewareConfig;
  var badUrl =
    'https://accounts.firefox.com/page?token=foo&code=bar&email=a@a.com&service=sync&resume=barbar';
  var goodUrl = 'https://accounts.firefox.com/page';

  var mockData = {
    exception: [
      {
        stacktrace: {
          frames: new Array(120),
        },
      },
    ],
    request: {
      headers: {
        Referer: badUrl,
      },
      url: badUrl,
    },
  };

  var response = config.dataCallback(mockData);

  assert.equal(response.request.headers.Referer, goodUrl);
  assert.equal(response.request.url, goodUrl);
  assert.equal(response.request.query_string, null);
  assert.equal(response.exception[0].stacktrace.frames.length, 10);
};

registerSuite('raven', suite);
