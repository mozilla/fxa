define([
  'intern!object',
  'intern/chai!assert',
  'require'
], function (registerSuite, assert, require) {
  var url = 'http://localhost:3030/signup';

  registerSuite({
    name: 'sign_up',

    'sign up': function () {
      var email = 'signup' + Math.random() + '@example.com';
      var password = '12345678';

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

        .waitForElementByCssSelector('.confirm h2')
        .elementByCssSelector('.confirm h2')
          .text()
          .then(function (resultText) {
            assert.ok(resultText.match(/^Confirm Your Account/), 'No errors in account creation');
          })
        .end()
    }
  });
});
