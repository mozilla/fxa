'use strict';

define([
  'views/base',
  'hgn!templates/sign_up',
  'gherkin',
  'lib/session',
  'constants'
],
function(BaseView, SignUpTemplate, gherkin, Session, Constants) {
  var SignUpView = BaseView.extend({
    template: SignUpTemplate,
    className: 'sign-up',

    events: {
      'submit form': 'signUp'
    },

    signUp: function(event) {
      event.preventDefault();

      if (! (this._validateEmail() && this._validatePassword())) return;

      var email = this.$('.email').val();
      var password = this.$('.password').val();

      var client;

      gherkin.Client.create(Constants.FXA_ACCOUNT_SERVER, email, password)
        .then(function (x) {
          client = x;

          return client.login();
        })
        .done(function () {
          Session.email = email;
          Session.token = client.sessionToken;

          router.navigate('confirm', { trigger: true });

          // email: email,
          // sessionToken: client.sessionToken,
          // keyFetchToken: client.keyFetchToken,
          // unwrapBKey: client.unwrapBKey

        },
        function (err) {
          this.$('.error').html(err.message);

          console.error('Error?', err);
        }.bind(this));
    },

    _validateEmail: function() {
      return this._isElementValid('.email');
    },

    _validatePassword: function() {
      return this._isElementValid('.password');
    },

    _isElementValid: function(selector) {
      var el = this.$(selector);
      var value = el.val();
      return value && el[0].validity.valid;
    }
  });

  return SignUpView;
});
