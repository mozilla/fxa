/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const jwcrypto = require('jwcrypto'),
      path = require('path'),
      request = require('supertest'),
      should = require('should'),
      spawn = require('child_process').spawn;

var runLocallyPath = path.join(__dirname, '..', '..', 'scripts', 'run_locally.js');
var runLocally;

describe('the server', function() {
  it('should start up', function(done) {
    runLocally = spawn('node', [runLocallyPath]);
    runLocally.stdout.on('data', function(data) {
      console.log(data.toString('utf8'));
      if (data.toString('utf8').indexOf(
        'FAB: Firefox Account Bridge listening at') !== -1) {
        done();
      }
    });
    runLocally.stderr.on('data', function(data) {
      console.error(data.toString('utf8'));
    });
  });

  it('should respond', function(done) {
    // TODO what does app mean here?
    request.get('/.well-known/browserid')
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

    var csfrResponse = request.get('/provision')
          .end(function(err, res) {
            var cookieHeader = res.headers['set-cookie'][0];
            var offset = '_csrf: "'.length;
            var start = res.text.indexOf('_csrf: "');
            var end = res.text.indexOf('"', start + offset);
            var csrf = res.text.substring(start + offset, end);
            var certificate;

            request.post('/provision')
              .send({email: 'lloyd@example.com', publicKey: publicKeyToCertify, duration: 1000*1000, _csrf: csrf})
              .set('cookie', cookieHeader)
              .end(function(err, res){
                   if (err) {
                     throw err;
                   }
                   certificate = JSON.parse(res.body.certificate);
                   (certificate.success).should.be.true;
                   // XXX replace with public key validation
                   (certificate.certificate.length > 500).should.be.true;
                   done();
              });
          });
  });
});