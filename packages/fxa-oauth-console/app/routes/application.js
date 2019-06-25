/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  session: Ember.inject.service('session'),
  beforeModel: function() {
    this.get('session').authenticate('authenticator:custom');
  },
  actions: {
    authenticateSession: function() {
      this.get('session').authenticate('authenticator:custom', {});
    },
    sessionAuthenticationFailed: function(/*error*/) {
      this.transitionTo('login');
    },
    sessionInvalidationSucceeded: function() {
      this.transitionTo('login');
    },
    sessionInvalidationFailed: function(/*error*/) {
      this.transitionTo('login');
    },
    sessionAuthenticationSucceeded: function() {
      this.transitionTo('index');
    },
  },
});
