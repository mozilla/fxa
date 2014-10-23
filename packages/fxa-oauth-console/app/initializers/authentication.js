/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Ember from 'ember';
import Base from 'simple-auth/authenticators/base';

/**
 * Custom Ember Simple Auth Authenticator
 * See docs: http://ember-simple-auth.simplabs.com/ember-simple-auth-api-docs.html
 */
var CustomAuthenticator = Base.extend({
  /**
   * Token endpoint
   */
  tokenEndpoint: '/oauth',
  /**
   * Restores application session data
   *
   * @param data
   * @returns {Rx.Promise}
   */
  restore: function(data) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (!Ember.isEmpty(data.token)) {
        resolve(data);
      } else {
        reject();
      }
    });
  },

  /**
   * Authenticate the user using the server side endpoint
   *
   * @returns {Rx.Promise}
   */
  authenticate: function () {
    var _this = this;

    return new Ember.RSVP.Promise(function (resolve, reject) {
      Ember.$.ajax({
        url: _this.tokenEndpoint + '/status',
        type: 'GET',
        contentType: 'application/json'
      }).then(function (response) {
        try {
          response = JSON.parse(response);
        } catch (e) {
          return reject(e);
        }

        Ember.run(function () {
          if (response && response.email && response.token && response.code) {

            return resolve({
              code: response.code,
              email: response.email,
              token: response.token
            });
          } else {

            return reject('Respose missing credential data.');
          }
        });
      }, function (xhr/*, status, error*/) {
        var response =  xhr.responseText;

        try {
          response = JSON.parse(xhr.responseText);
        } catch (e) {
          return reject();
        }

        Ember.run(function () {
          return reject(response.error);
        });
      });
    });
  },

  /**
   * Invalidates the user session on the server
   *
   * @returns {Rx.Promise}
   */
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
  initialize: function (container) {
    // registers the custom authenticator
    container.register('authenticator:custom', CustomAuthenticator);
  }
};
