define([
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/dojo/node!picl-gherkin'
], function (registerSuite, assert, require, fxaClient) {
  var url = 'http://localhost:3030/signin';
  var password = 'password';
  var email;

  registerSuite({
    name: 'sign_in',

    setup: function () {
      email = 'signin' + Math.random() + '@example.com';
      return fxaClient.create('http://127.0.0.1:9000', email, password, { preVerified: true });
    },

    'sign in': function () {

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementByTagName('h1')

        .elementByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .elementByCssSelector('form input.password')
          .click()
          .type(password)
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end()

        .waitForElementByCssSelector('.settings p.center')
        .elementByCssSelector('.settings p.center')
          .text()
          .then(function (resultText) {
            assert.ok(resultText.match(/^Congratulations,/), 'No errors in sign in');
          })
        .end()
    }
  });
});
