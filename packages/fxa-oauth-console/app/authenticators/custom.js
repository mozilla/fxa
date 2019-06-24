/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Ember from 'ember';
import Base from 'ember-simple-auth/authenticators/base';
import config from '../config/environment';

/**
 * Custom Ember Simple Auth Authenticator
 * See docs: http://ember-simple-auth.simplabs.com/ember-simple-auth-api-docs.html
 */
export default Base.extend({
  /**
   * Token endpoint
   */
  tokenEndpoint: config.baseURL + 'oauth',
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
  authenticate: function() {
    var self = this;

    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax({
        url: self.tokenEndpoint + '/status',
        type: 'GET',
        contentType: 'application/json',
      }).then(
        function(response) {
          try {
            response = JSON.parse(response);
          } catch (e) {
            return reject(e);
          }

          Ember.run(function() {
            if (response && response.email && response.token) {
              return resolve({
                email: response.email,
                token: response.token,
              });
            } else {
              return reject('Response missing credential data.');
            }
          });
        },
        function(xhr /*, status, error*/) {
          var response = xhr.responseText;

          try {
            response = JSON.parse(xhr.responseText);
          } catch (e) {
            return reject();
          }

          Ember.run(function() {
            return reject(response.error);
          });
        }
      );
    });
  },

  /**
   * Invalidates the user session on the server
   *
   * @returns {Rx.Promise}
   */
  invalidate: function() {
    var self = this;

    return new Ember.RSVP.Promise(function(resolve) {
      Ember.$.ajax({
        url: self.tokenEndpoint + '/logout',
        type: 'GET',
      }).always(function() {
        return resolve();
      });
    });
  },
});
