define([
  'intern!tdd',
  'intern/chai!assert',
  'client/FxAccountClient',
  'intern/node_modules/dojo/has!host-node?intern/node_modules/dojo/node!xmlhttprequest'
], function (tdd, assert, FxAccountClient, xhr) {
  with (tdd) {
    suite('fxa client', function () {
      var client;
      var baseUri = 'http://127.0.0.1:9000/v1';

      before(function () {
        // use an xhr shim in node.js
        var xhrFactory = xhr ? (function () { return new xhr.XMLHttpRequest(); }) : undefined;
        client = new FxAccountClient(baseUri, { xhr: xhrFactory });
      });

      test('#create account (async)', function () {
        var email = "test" + Date.now() + "@restmail.net";
        var password = "iliketurtles";
        return client.proxiedSignUp(email, password)
          .then(function (res) {
            assert.ok(res.uid);
          });
      });

      test('#sign in (async)', function () {
        var email = "test" + Date.now() + "@restmail.net";
        var password = "iliketurtles";
        return client.proxiedSignUp(email, password)
          .then(function (res) {
            return client.proxiedSignIn(email, password);
          })
          .then(function (res) {
            assert.ok(res.sessionToken);
          });
      });

    });
  }
});
