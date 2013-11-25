define([
  'intern!tdd',
  'intern/chai!assert',
  'client/FxAccountClient',
  'intern/node_modules/dojo/has!host-node?intern/node_modules/dojo/node!xmlhttprequest'
], function (tdd, assert, FxAccountClient, XHR) {
  with (tdd) {
    suite('fxa client', function () {
      var client;
      var baseUri = 'http://127.0.0.1:9000/v1';

      before(function () {
        // use an xhr shim in node.js
        var xhr = XHR ? XHR.XMLHttpRequest : undefined;
        client = new FxAccountClient(baseUri, { xhr: xhr });
      });

      test('#create account (async)', function () {
        var email = "test" + Date.now() + "@restmail.net";
        var password = "iliketurtles";
        return client.signUp(email, password)
          .then(function (res) {
            assert.ok(res.uid);
          });
      });

      test('#sign in (async)', function () {
        var email = "test" + Date.now() + "@restmail.net";
        var password = "iliketurtles";
        return client.signUp(email, password)
          .then(function (res) {
            return client.signIn(email, password);
          })
          .then(function (res) {
            assert.ok(res.sessionToken);
          });
      });

    });
  }
});
