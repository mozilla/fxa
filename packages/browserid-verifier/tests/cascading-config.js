/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global describe,it */

const should = require('should');

var Verifier = require('./lib/verifier.js'),
  async = require('async'),
  temp = require('temp'),
  fs = require('fs');

describe('cascading configuration files', function () {
  var verifier;

  it('create a couple configuration files', function (done) {
    var aPath = temp.path({ suffix: '.json' }),
      bPath = temp.path({ suffix: '.json' });

    // because "b" is specified later, it should over-ride "a"
    verifier = new Verifier({
      files: aPath + ',' + bPath,
    });

    async.parallel(
      [
        function (cb) {
          fs.writeFile(
            aPath,
            JSON.stringify({ fallback: 'a.example.com' }),
            cb
          );
        },
        function (cb) {
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

  it('test servers should start and finish cleanly', async () => {
    verifier.buffer(true);
    should(verifier.process).equal(undefined);
    await new Promise((resolve, error) => verifier.start(resolve));
    should(verifier.process).not.equal(null);
    await new Promise((resolve, error) => verifier.stop(resolve));
    should(verifier.process).equal(null);
  });

  it('verifier should have determined proper configuration', () => {
    verifier.buffer().indexOf('a.example.com').should.equal(-1);
    verifier.buffer().indexOf('b.example.com').should.not.equal(-1);
  });
});
