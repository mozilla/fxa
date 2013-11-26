/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global describe,it,require */

// load testing tools from the browserid-local-verify library
var testing = require('browserid-local-verify/testing');

describe('basic verifier test', function() {
  it('testing tools should be defined', function(done) {
    console.log(testing);
    done(null);
  });
});
