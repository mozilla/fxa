/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const sjcl = require('sjcl');
const credentials = require('../../client/lib/credentials');
describe('credentials', function() {
  it('#client stretch-KDF vectors', function() {
    var email = sjcl.codec.utf8String.fromBits(
      sjcl.codec.hex.toBits('616e6472c3a9406578616d706c652e6f7267')
    );
    var password = sjcl.codec.utf8String.fromBits(
      sjcl.codec.hex.toBits('70c3a4737377c3b67264')
    );

    return credentials.setup(email, password).then(function(result) {
      var quickStretchedPW = sjcl.codec.hex.fromBits(result.quickStretchedPW);
      var authPW = sjcl.codec.hex.fromBits(result.authPW);
      var unwrapBKey = sjcl.codec.hex.fromBits(result.unwrapBKey);

      assert.equal(
        quickStretchedPW,
        'e4e8889bd8bd61ad6de6b95c059d56e7b50dacdaf62bd84644af7e2add84345d',
        '== quickStretchedPW is equal'
      );
      assert.equal(
        authPW,
        '247b675ffb4c46310bc87e26d712153abe5e1c90ef00a4784594f97ef54f2375',
        '== authPW is equal'
      );
      assert.equal(
        unwrapBKey,
        'de6a2648b78284fcb9ffa81ba95803309cfba7af583c01a8a1a63e567234dd28',
        '== unwrapBkey is equal'
      );
    }, assert.fail);
  });

  it('#wrap', function() {
    var bit1 = sjcl.codec.hex.toBits(
      'c347de41c8a409c17b5b88e4985e1cd10585bb79b4a80d5e576eaf97cd1277fc'
    );
    var bit2 = sjcl.codec.hex.toBits(
      '3afd383d9bc1857318f24c5f293af62254f0476f0aaacfb929c61b534d0b5075'
    );
    var result = credentials.xor(bit1, bit2);

    assert.equal(
      sjcl.codec.hex.fromBits(result),
      'f9bae67c53658cb263a9c4bbb164eaf35175fc16be02c2e77ea8b4c480192789',
      '== wrap worked correctly'
    );
  });
});
