(function () {

  var CERT_DURATION = 86400000;
  var SERVER = 'http://auth.oldsync.dev.lcip.org/';

  var jwcrypto = require("./lib/jwcrypto");
  jwcrypto.addEntropy(crypto.getRandomValues(new Uint8Array(32)));

  function AssertionService(client) {
    this.client = client;
  }

  /**
   * Initializes the assertion request process
   * @param cb Callback returns
   * {String} assertion
   * if fails returns err Error during the process
   */
  AssertionService.prototype.getAssertion = function (cb) {
    this.generateKeys(function (err) {
      if (err) console.log(err);

      this.requestSignedKeyCertificate(function (err) {
        if (err) console.log(err);

        this.createAssertion(function (err, assertion) {
          if (err) console.log(err);
          if (cb) cb(err, assertion);
        });

      }.bind(this));

    }.bind(this));
  };

  /**
   * Generates the secret and public key
   * @param cb Callback after the keys are set
   */
  AssertionService.prototype.generateKeys = function (cb) {
    jwcrypto.generateKeypair({algorithm: "DS", keysize: 256}, function (err, keypair) {
      this.sk = keypair.secretKey;
      this.pk = keypair.publicKey;
      if (cb) cb(err);
    }.bind(this))
  };

  /**
   * Requests a signed assertion certificate
   * @param cb Callback after the certificate is set
   */
  AssertionService.prototype.requestSignedKeyCertificate = function (cb) {
    this.client.sign(this.pk.toSimpleObject(), CERT_DURATION, function (err, cert) {
      this.cert = cert;
      if (cb) cb();
    }.bind(this))
  };


  /**
   * Creates a signed assertion
   * @param cb Callback,
   * if successful returns
   * {String} assertion Signed assertion
   * if it fails, returns
   * err Error occurred while signing
   */
  AssertionService.prototype.createAssertion = function (cb) {
    var EXPIRES_AT = new Date(new Date().valueOf() + 3600 * 1000 * 24 * 365);

    jwcrypto.assertion.sign(
      {}, {audience: SERVER, expiresAt: EXPIRES_AT},
      this.sk,
      function (err, signedAssertion) {
        var assertion = jwcrypto.cert.bundle([this.cert], signedAssertion);
        cb(err, assertion);
      }.bind(this));
  };

  window.AssertionService = AssertionService
})();
