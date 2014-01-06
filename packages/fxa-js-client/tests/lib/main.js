define([
  'intern!tdd',
  'intern/chai!assert',
  'client/FxAccountClient',
  'intern/node_modules/dojo/has!host-node?intern/node_modules/dojo/node!xmlhttprequest',
  'tests/addons/sinonResponder',
  'tests/mocks/request'
], function (tdd, assert, FxAccountClient, XHR, SinonResponder, RequestMocks) {
  with (tdd) {
    suite('fxa client', function () {
      var client;
      var requests;
      var baseUri = 'http://127.0.0.1:9000/v1';

      beforeEach(function () {
        // TODO: allow real requests by using 'XHR'
        var xhr = SinonResponder.useFakeXMLHttpRequest();
        requests = [];

        xhr.onCreate = function (xhr) {
          requests.push(xhr);
        };
        client = new FxAccountClient(baseUri, { xhr: xhr });
      });


      test('#create account (async)', function () {
        var email = "test" + Date.now() + "@restmail.net";
        var password = "iliketurtles";
        var signUpRequest = client.signUp(email, password)
          .then(function (res, b, c) {
            assert.ok(res.uid);
          });

        setTimeout(function() {
          SinonResponder.respond(requests[0], RequestMocks.signUp);
        }, 200);

        return signUpRequest;
      });

      test('#sign in (async)', function () {
        var email = "test" + Date.now() + "@restmail.net";
        var password = "iliketurtles";
        var signUpRequest =  client.signUp(email, password)
          .then(function (res) {
            var signInRequest = client.signIn(email, password);

            setTimeout(function() {
              SinonResponder.respond(requests[1], RequestMocks.signIn);
            }, 200);

            return signInRequest;
          })
          .then(function (res) {
            assert.ok(res.sessionToken);
          });

        setTimeout(function() {
          SinonResponder.respond(requests[0], RequestMocks.signUp);
        }, 200);

        return signUpRequest;
      });

    });
  }
});
