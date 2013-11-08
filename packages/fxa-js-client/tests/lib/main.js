define([
  'intern!tdd',
  'intern/chai!assert',
  'client/FxAccountClient',
  'intern/node_modules/dojo/has!host-node?intern/node_modules/dojo/node!xmlhttprequest',
  'tests/addons/sinonResponder',
  'tests/mocks/request',
  'client/lib/request'
], function (tdd, assert, FxAccountClient, XHR, SinonResponder, RequestMocks, Request) {

  with (tdd) {
    suite('fxa client', function () {
      var client;
      var requests;
      var baseUri = 'http://127.0.0.1:9000/v1';
      var restmailClient;

      beforeEach(function () {
        // TODO: allow real requests by using 'XHR'
        var xhr = SinonResponder.useFakeXMLHttpRequest();
        requests = [];

        xhr.onCreate = function (xhr) {
          requests.push(xhr);
        };

        client = new FxAccountClient(baseUri, { xhr: xhr });
        restmailClient = new Request('http://restmail.net', xhr);
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

      test('#verify email', function () {
        var user = 'test3' + Date.now();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var uid;

        setTimeout(function() {
          SinonResponder.respond(requests[0], RequestMocks.signUp);
        }, 200);

        return client.signUp(email, password)
          .then(function (result) {

            uid = result.uid;

            assert.ok(uid, "uid is returned");

            setTimeout(function() {
              SinonResponder.respond(requests[1], RequestMocks.mail);
            }, 200);

            return waitForEmail(user);
          })
          .then(function (emails) {

            setTimeout(function() {
              SinonResponder.respond(requests[2], RequestMocks.verifyCode);
            }, 200);

            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
            assert.ok(code, "code is returned");
            return client.verifyCode(uid, code);
          })
      });

      // utility function that waits for a restmail email to arrive
      function waitForEmail(user) {
        return restmailClient.send('/mail/' + user, 'GET')
          .then(function(result) {
            if (result.length > 0) {
              return result;
            } else {
              var deferred = p.defer();

              setTimeout(function() {
                waitForEmail(user)
                  .then(function(emails) {
                    deferred.resolve(emails);
                  }, function(err) {
                    deferred.reject(err);
                  });
              }, 1000);
              return deferred.promise;
            }
          });
      }

    });
  }
});
