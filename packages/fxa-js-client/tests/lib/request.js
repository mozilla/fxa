define([
  'intern!tdd',
  'intern/chai!assert',
  'client/lib/request',
  'intern/node_modules/dojo/has!host-node?intern/node_modules/dojo/node!xmlhttprequest',
  'tests/addons/sinonResponder',
  'tests/mocks/request'
], function (tdd, assert, Request, XHR, SinonResponder, RequestMocks) {
  with (tdd) {
    suite('request module', function () {
      var client;
      var requests;
      var baseUri = 'http://127.0.0.1:9000';

      beforeEach(function () {
        var xhr = SinonResponder.useFakeXMLHttpRequest();
        requests = [];

        xhr.onCreate = function (xhr) {
          requests.push(xhr);
        };

        client = new Request(baseUri, xhr);
      });

      test('#heartbeat (async)', function () {
        var heartbeatRequest =  client.send("/__heartbeat__", "GET")
          .then(function (res) {
            assert.ok(res);
          });
        SinonResponder.respond(requests[0], RequestMocks.heartbeat);

        return heartbeatRequest;
      });
    });
  }
});
