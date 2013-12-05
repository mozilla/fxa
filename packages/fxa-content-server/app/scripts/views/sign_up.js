'use strict';

define([
  'views/base',
  'hgn!templates/sign_up',
  'gherkin',
  'lib/session'
],
function(BaseView, SignUpTemplate, gherkin, Session) {
  var SignUpView = BaseView.extend({
    template: SignUpTemplate,
    className: 'sign-up',

    events: {
      'submit form': 'signUp'
    },

    signUp: function(event) {
      event.preventDefault();

      var email = this.$('.email').val();
      var password = this.$('.password').val();

      var client;

      gherkin.Client.create('http://127.0.0.1:9000', email, password)
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
    }
  });

  return SignUpView;
});
