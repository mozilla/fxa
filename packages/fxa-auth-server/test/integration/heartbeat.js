var assert = require('assert');
var helpers = require('../helpers');

var testClient = new helpers.TestClient();

describe('heartbeat', function() {
  it('returns ok', function(done) {
    testClient.makeRequest('GET', '/__heartbeat__', function(res) {
      try {
        assert.equal(res.statusCode, 200);
        assert.equal(res.result, 'ok');
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
