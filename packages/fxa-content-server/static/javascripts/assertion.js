function AssertionRequest(client) {
  this.SERVER = 'http://auth.oldsync.dev.lcip.org/';
  this.EXPIRES_AT = new Date(new Date().valueOf() + 3600 * 1000 * 24 * 365);
  this.CERT_DURATION = 86400000;
  this.jwcrypto = require("./lib/jwcrypto");
  this.jwcrypto.addEntropy(crypto.getRandomValues(new Uint8Array(32)));
  this.client = client;
}

/**
 * Initializes the assertion request process
 * @param cb Callback returns
 * {String} assertion
 * if fails returns err Error during the process
 */
AssertionRequest.prototype.init = function (cb) {
  this.setKeys(function (err) {
    if (err) console.log(err);

    this.setCertificate(function (err) {
      if (err) console.log(err);

      this.getAssertion(function (err, assertion) {
        if (err) console.log(err);
        if (cb) cb(err, assertion);
      });

    }.bind(this));

  }.bind(this));
};

/**
 * Sets the secret and public key
 * @param cb Callback after the keys are set
 */
AssertionRequest.prototype.setKeys = function (cb) {
  this.jwcrypto.generateKeypair({algorithm: "DS", keysize: 256}, function (err, keypair) {
    this.sk = keypair.secretKey;
    this.pk = keypair.publicKey;
    if (cb) cb(err);
  }.bind(this))
};

/**
 * Sets assertion certificate
 * @param cb Callback after the certificate is set
 */
AssertionRequest.prototype.setCertificate = function (cb) {
  this.client.sign(this.pk.toSimpleObject(), this.CERT_DURATION, function (err, cert) {
    this.cert = cert;
    if (cb) cb();
  })
};


/**
 * Get a signed assertion
 * @param cb Callback,
 * if successful returns
 * {String} assertion Signed assertion
 * if it fails, returns
 * err Error occurred while signing
 */
AssertionRequest.prototype.getAssertion = function (cb) {
  this.jwcrypto.assertion.sign(
    {}, {audience: this.SERVER, expiresAt: this.EXPIRES_AT},
    this.sk,
    function (err, signedAssertion) {
      var assertion = this.jwcrypto.cert.bundle([this.cert], signedAssertion);
      cb(err, assertion);
    }.bind(this));
};
