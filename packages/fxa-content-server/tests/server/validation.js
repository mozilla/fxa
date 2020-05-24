/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const assert = intern.getPlugin('chai').assert;
const { registerSuite } = intern.getInterface('object');
const request = require('request-promise');
const validation = require('../../server/lib/validation');

const METRICS_DOCS_URL =
  'https://raw.githubusercontent.com/mozilla/application-services/master/docs/product-portal/accounts/metrics.md';
const UTM_REGEX = validation.TYPES.UTM._tests[1].arg.pattern;
const REGEXES = new Map([
  ['entrypoint', validation.PATTERNS.ENTRYPOINT],
  ['entrypoint_experiment', validation.PATTERNS.ENTRYPOINT],
  ['entrypoint_variation', validation.PATTERNS.ENTRYPOINT],
  ['utm_campaign', UTM_REGEX],
  ['utm_content', UTM_REGEX],
  ['utm_medium', UTM_REGEX],
  ['utm_source', UTM_REGEX],
  ['utm_term', UTM_REGEX],
]);

let docs;

registerSuite('validation', {
  before() {
    return request({ url: METRICS_DOCS_URL }).then((result) => (docs = result));
  },

  tests: Array.from(REGEXES.entries()).reduce((tests, [name, regex]) => {
    tests[`${name} regex matches documentation`] = () => {
      let parts = docs.split(`<!--begin-validation-${name}-->`);
      assert.equal(parts.length, 2, 'failed to find begin delimiter');
      parts = parts[1].split(`<!--end-validation-${name}-->`);
      assert.equal(parts.length, 2, 'failed to find end delimiter');
      const expected = `/${parts[0]}/`;
      const actual = regex.toString();
      assert.equal(actual, expected);
    };
    return tests;
  }, {}),
});
