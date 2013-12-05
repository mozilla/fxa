'use strict';

define([
  'views/base',
  'hgn!templates/sign_in',
  'gherkin',
  'lib/session'
  ],
  function(BaseView, SignInTemplate, gherkin, Session){
    var SignInView = BaseView.extend({
      template: SignInTemplate,
      className: 'sign-in',

      events: {
        'submit form': 'signIn'
      },

      signIn: function(event) {
        var email = this.$('.email').val();
        var password = this.$('.password').val();

        var client;

        gherkin.Client.login('http://127.0.0.1:9000', email, password)
          .then(function (client) {
            alert("You're signed in!");

            Session.email = email;
            Session.token = client.sessionToken;
          })
          .done(null, function (err) {
            this.$('.error').html(err.message);

            console.error('Error?', err);
          }.bind(this));
      }
    });

    return SignInView;
  }
);
