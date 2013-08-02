var should = require('should');

process.env['NODE_ENV'] = 'development'; // set env to testing so we can skip logging, etc.
process.env['PORT'] = '0'; // for testing bind ephemeral ports
process.env['HOSTNAME'] = '127.0.0.1';

var fab = require('../bin/firefox_account_bridge.js');

describe('can start', function() {
  it('should be true that', function(done) {

    var fs = require('fs');
    fs.exists('./server/bin/firefox_account_bridge.js', function( exists ) {
      console.log( ( exists  ? "File is there" : "File is not there" ) );
      //done();
    });

    var app = fab.makeApp();
    fab.listen(app);
    (!!app).should.be.true;
    done();
   });
});