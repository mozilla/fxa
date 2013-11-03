define([
  'intern!tdd',
  'intern/chai!assert',
  'gherkin/FxAccountClient'
], function (tdd, assert, FxAccountClient) {
  with (tdd) {
    suite('demo', function () {
      var client;

      before(function () {
        client = new FxAccountClient();
      });

      test('#isAwesome', function () {
        assert.strictEqual(client.isAwesome(), true);
      });

      test('#hawkModule', function () {
        assert.strictEqual(client.hawkHeaderVersion, '1');
      });

      test('#sjclModule', function () {
        assert.strictEqual(client.sjcl.json.defaults.cipher, 'aes');
      });

    });
  }
});
