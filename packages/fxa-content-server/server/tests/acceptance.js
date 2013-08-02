var should = require('should');

process.env['NODE_ENV'] = 'development'; // set env to testing so we can skip logging, etc.
process.env['PORT'] = '0'; // for testing bind ephemeral ports
process.env['HOSTNAME'] = '127.0.0.1';

var fab = require('../bin/firefox_account_bridge.js');
var app;

describe('can start', function() {
  it('should be true that', function(done) {
    app = fab.makeApp();
    var listening = fab.listen(app);
    (listening).should.be.true;
    done();
   });
});