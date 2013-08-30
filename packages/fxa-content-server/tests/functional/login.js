define([
  'intern!object',
  'intern/chai!assert',
  'require'
], function (registerSuite, assert, require) {
  var url = 'http://localhost:3030/flow';

  registerSuite({
    name: 'login',

    'create account form': function () {
      var email = 'some-unknown-email@email.com';
      var password = 'password';

      return this.remote
        .get(require.toUrl(url))
        .wait(1000)

        .elementByCssSelector('#dialog x-tabbox x-tab:last-child')
          .clickElement()
          .end()

        .wait(1000)

        .elementByCssSelector('#dialog .login-panel .email')
          .click()
          .type(email)
        .end()

        .elementByCssSelector('#dialog .login-panel .password')
          .click()
          .type(password)
        .end()

        .elementByCssSelector('#dialog .login-panel .go')
          .click()
        .end()

        .wait(1000)

        .elementByCssSelector('#dialog .login-panel .error')
        .text()
        .then(function (text) {
          assert.strictEqual(text, 'Try another email or Create an account', 'Validates false login');
        })
        .end()
    }
  });
});