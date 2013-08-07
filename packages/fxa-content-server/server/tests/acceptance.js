var should = require('should');
var request = require('supertest');
var jwcrypto = require('jwcrypto');
// This require creates state inside jwcrypto that lets call to
// generateKeypair({algorithm: "RS", ...}) work
require("jwcrypto/lib/algs/rs");

process.env['NODE_ENV'] = 'development'; // set env to testing so we can skip logging, etc.
process.env['PORT'] = '0'; // for testing bind ephemeral ports
process.env['HOSTNAME'] = '127.0.0.1';

var fab = require('../bin/firefox_account_bridge.js');
var app;

describe('the server', function() {
  it('should start up', function(done) {
    app = fab.makeApp();
    var listening = fab.listen(app);
    (listening).should.be.true;
    done();
   });

  it('should respond', function(done) {
    request(app)
    .get('/.well-known/browserid')
    .expect('Content-Type', /json/)
    .expect(/public-key/) // string or regex matching expected well-known json
    .end(function(err, res){
      if (err) {
        throw err;
      }
      done();
    });
  });

  it('can certify', function(done) {
    var publicKeyToCertify;
    jwcrypto.generateKeypair({algorithm: "RS", keysize: 256}, function(err, keyPair) {
      if (err) {
        throw err;
      }
      publicKeyToCertify = keyPair.publicKey.serialize();
    });

    request(app)
    .post('/provision', {email: 'lloyd@example.com', publicKey: publicKeyToCertify, duration: 1000*1000})
    .expect('Content-Type', /json/)
    .expect(/public-key/) // string or regex matching expected well-known json
    .end(function(err, res){
      console.log('RES: '+ res.text);
      if (err) {
        throw err;
      }
      done();
    });
  });
});