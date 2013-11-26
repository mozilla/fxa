/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global describe,it,require */

var
IdP = require('browserid-local-verify/testing').IdP,
Verifier = require('./lib/verifier.js');

describe('basic verifier test', function() {
  var idp = new IdP();
  var verifier = new Verifier();

  it('test servers should start', function(done) {
    idp.start(function(e) {
      verifier.setFallback(idp);
      verifier.start(function(e1) {
        done(e || e1);
      });
    });
  });

  it('test servers should stop', function(done) {
    idp.stop(function(e) {
      verifier.stop(function(e1) {
        done(e || e1);
      });
    });
  });
});
