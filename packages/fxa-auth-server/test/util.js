/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const util = require('../lib/util');

describe('srp response keys', function() {

  it('should generate the correct respHMACkey and respXORkey', function(done) {
    var srpK = new Buffer('000102030405060708090a0b0c0d0e0f' +
                          '101112131415161718191a1b1c1d1e1f', 'hex');

    util.srpResponseKeys(srpK, function(err, results) {
      var respHMACkey = '9e8b9573280f1daf3c658ce6682605c8' +
                        'c1aca7ba76506781154ebe79202cd3c6';

      var respXORkey = 'b800c5f1f2383a335d3c74cd914c1928' +
                       'c20982ce7a7f0eeca9b82039cd350128' +
                       'c10d0d23bfa33defd5978ca6565e76b2' +
                       '417796c43d4a5ffadd348a4add3eb3e4' +
                       '8ceb9b874909026cda0b56111e555fbb' +
                       '05ce8c8bcb5e26c58af5dafead71b486';
      try {
        assert.equal(results.respHMACkey.toString('hex'), respHMACkey);
        assert.equal(results.respXORkey.toString('hex'), respXORkey);
      } catch (e) {
        return done(e);
      }
      done();
    });
  });

  it('should generate the correct encrypted bundle', function() {
      var respHMACkey = new Buffer('9e8b9573280f1daf3c658ce6682605c8' +
                        'c1aca7ba76506781154ebe79202cd3c6', 'hex');

      var respXORkey = new Buffer('b800c5f1f2383a335d3c74cd914c1928' +
                       'c20982ce7a7f0eeca9b82039cd350128' +
                       'c10d0d23bfa33defd5978ca6565e76b2' +
                       '417796c43d4a5ffadd348a4add3eb3e4' +
                       '8ceb9b874909026cda0b56111e555fbb' +
                       '05ce8c8bcb5e26c58af5dafead71b486', 'hex');

      var kA = new Buffer('202122232425262728292a2b2c2d2e2f' +
                          '303132333435363738393a3b3c3d3e3f', 'hex');

      var wrapKb = new Buffer('404142434445464748494a4b4c4d4e4f' +
                              '505152535455565758595a5b5c5d5e5f', 'hex');

      var signToken = new Buffer('606162636465666768696a6b6c6d6e6f' +
                                 '707172737475767778797a7b7c7d7e7f', 'hex');

      var result = util.srpSignTokenBundle({
        kA: kA,
        wrapKb: wrapKb,
        signToken: signToken,
        hmacKey: respHMACkey,
        encKey: respXORkey
      });

      var expected = '9821e7d2d61d1c1475155ee6bd613707' +
                     'f238b0fd4e4a38db91811a02f1083f17' +
                     '814c4f60fbe67ba89ddec6ed1a1338fd' +
                     '1126c497691f09ad856dd0118163edbb' +
                     'ec8af9e42d6c640bb2623c7a723831d4' +
                     '75bffef8bf2b50b2f28ca085d10ccaf9' +
                     '82e93a55e9a907f6e89160001c45f925' +
                     'f19911e2df1296865c934e41eaa8102a';

      assert.equal(result.toString('hex'), expected);
  });

});
