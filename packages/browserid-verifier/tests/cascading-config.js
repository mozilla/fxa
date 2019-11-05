/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global describe,it */

require('should');

var Verifier = require('./lib/verifier.js'),
  async = require('async'),
  temp = require('temp'),
  fs = require('fs');

describe('cascading configuration files', function() {
  var verifier;

  it('create a couple configuration files', function(done) {
    var aPath = temp.path({ suffix: '.json' }),
      bPath = temp.path({ suffix: '.json' });

    // because "b" is specified later, it should over-ride "a"
    verifier = new Verifier({
      files: aPath + ',' + bPath,
    });

    async.parallel(
      [
        function(cb) {
          fs.writeFile(
            aPath,
            JSON.stringify({ fallback: 'a.example.com' }),
            cb
          );
        },
        function(cb) {
          fs.writeFile(
            bPath,
            JSON.stringify({ fallback: 'b.example.com' }),
            cb
          );
        },
      ],
      done
    );
  });

  it('test servers should start', function(done) {
    verifier.buffer(true);
    verifier.start(done);
  });

  it('test servers should shutdown cleanly', function(done) {
    verifier.stop(done);
  });

  it('verifier should have determined proper configuration', function(done) {
    verifier
      .buffer()
      .indexOf('a.example.com')
      .should.equal(-1);
    verifier
      .buffer()
      .indexOf('b.example.com')
      .should.not.equal(-1);
    done();
  });
});
