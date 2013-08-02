var should = require('should');
var request = require('supertest');

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
});

describe('can serve well_known', function() {
  it('should respond', function(done) {
    request(app)
    .get('/.well-known/browserid')
    .expect('Content-Type', /json/)
    .end(function(err, res){
      if (err) throw err;
    });
    done();
  });
});