import Ember from 'ember';
import Base from 'simple-auth/authenticators/base';

var CustomAuthorizer = Base.extend({
  authorize: function (jqXHR/*, requestOptions*/) {
    if (this.get('session.email') && !Ember.isEmpty(this.get('session.token'))) {
      jqXHR.setRequestHeader('Authorization', 'Token: ' + this.get('session.token'));
    }
  }
});

var CustomAuthenticator = Base.extend({
  tokenEndpoint: '/oauth',

  authenticate: function () {
    var _this = this;

    return new Ember.RSVP.Promise(function (resolve, reject) {
      Ember.$.ajax({
        url: _this.tokenEndpoint + '/status',
        type: 'GET',
        contentType: 'application/json'
      }).then(function (response) {
        response = JSON.parse(response);

        Ember.run(function () {
          if (response && response.email) {
            return resolve({ email: response.email });
          } else {
            return reject();
          }
        });
      }, function (xhr/*, status, error*/) {
        var response =  xhr.responseText;
        try {
          response = JSON.parse(xhr.responseText);
        } catch (e) {

        }

        Ember.run(function () {
          reject(response.error);
        });
      });
    });
  },

  invalidate: function () {
    var _this = this;

    return new Ember.RSVP.Promise(function(resolve) {
      Ember.$.ajax({
        url: _this.tokenEndpoint + '/logout',
        type: 'GET'
      }).always(function() {
        resolve();
      });
    });
  }
});

export default {
  name: 'authentication',
  before: 'simple-auth',
  initialize: function (container/*, application*/) {
    container.register('authenticator:custom', CustomAuthenticator);
    container.register('authorizer:custom', CustomAuthorizer);
  }
};
