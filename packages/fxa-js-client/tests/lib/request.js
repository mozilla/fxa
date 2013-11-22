define([
  'intern!tdd',
  'intern/chai!assert',
  'client/lib/request',
  'intern/node_modules/dojo/has!host-node?intern/node_modules/dojo/node!xmlhttprequest'
], function (tdd, assert, Request, xhr) {
  with (tdd) {
    suite('request module', function () {
      var client;
      var baseUri = 'http://127.0.0.1:9000';

      before(function () {
        // use an xhr shim in node.js
        var xhrFactory = xhr ? (function () { return new xhr.XMLHttpRequest(); }) : undefined;
        client = new Request(baseUri, xhrFactory);
      });

      test('#heartbeat (async)', function () {
        return client.send("/__heartbeat__", "GET")
          .then(function (res) {
            assert.ok(res);
          });
      });
    });
  }
});
