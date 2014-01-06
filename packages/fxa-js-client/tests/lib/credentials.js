define([
  'intern!tdd',
  'intern/chai!assert',
  'client/vendor/sjcl',
  'client/lib/credentials'
], function (tdd, assert, sjcl, credentials) {
  with (tdd) {
    suite('client setupCredentials', function () {
      test('#client stretch-KDF vectors', function () {
        var email = sjcl.codec.utf8String.fromBits(sjcl.codec.hex.toBits('616e6472c3a9406578616d706c652e6f7267'));
        var password = sjcl.codec.utf8String.fromBits(sjcl.codec.hex.toBits('70c3a4737377c3b67264'));

        return credentials.setup(email, password)
          .then(
            function(result) {
              var quickStretchedPW = sjcl.codec.hex.fromBits(result.quickStretchedPW);
              var authPW = sjcl.codec.hex.fromBits(result.authPW);
              var unwrapBkey = sjcl.codec.hex.fromBits(result.unwrapBkey);

              assert.equal(quickStretchedPW, 'e4e8889bd8bd61ad6de6b95c059d56e7b50dacdaf62bd84644af7e2add84345d', '== quickStretchedPW is equal');
              assert.equal(authPW, '247b675ffb4c46310bc87e26d712153abe5e1c90ef00a4784594f97ef54f2375', '== authPW is equal');
              assert.equal(unwrapBkey, 'de6a2648b78284fcb9ffa81ba95803309cfba7af583c01a8a1a63e567234dd28', '== unwrapBkey is equal');
            }
          );
      });
    });
  }
});
