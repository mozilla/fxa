define([
  'intern!object',
  'intern/chai!assert',
  'require'
], function (registerSuite, assert, require) {
  var url = 'http://localhost:3030/flow';

  registerSuite({
    name: 'login',

    'create account form': function () {
      return this.remote
        .get(require.toUrl(url))
        .wait(1000)
        .elementByCssSelector('#dialog x-tabbox x-tab:last-child')
        .clickElement()
        .text()
        .then(function (text) {
          assert.strictEqual(text, 'Sign In', 'Switched tab to sign in');
        })
        .end()
    }
  });
});