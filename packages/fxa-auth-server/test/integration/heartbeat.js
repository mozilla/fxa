var assert = require('assert');
var helpers = require('../helpers');

var testClient = new helpers.TestClient();

describe('heartbeat', function() {
  it('returns ok', function(done) {
    testClient.makeRequest('GET', '/__heartbeat__', function(res) {
      assert.equal(res.statusCode, 200);
      assert.equal(res.result, 'ok');
      done();
    });
  });
});
