/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Ember from 'ember';
import Base from 'simple-auth/authenticators/base';

var CustomAuthenticator = Base.extend({
  tokenEndpoint: '/oauth',

  restore: function(data) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (!Ember.isEmpty(data.token)) {
        resolve(data);
      } else {
        reject();
      }
    });
  },

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
          if (response && response.email && response.token) {

            return resolve({
              email: response.email,
              token: response.token
            });
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
        return resolve();
      });
    });
  }
});

export default {
  name: 'authentication',
  before: 'simple-auth',
  initialize: function (container/*, application*/) {
    container.register('authenticator:custom', CustomAuthenticator);
  }
};
