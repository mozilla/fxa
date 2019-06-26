/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  controllerName: 'client/register',
  actions: {
    create: function() {
      var model = this.controllerFor('client.register').get('model');

      return model
        .save()
        .then(() =>
          this.controllerFor('client.register').set('registrationSuccess', true)
        );
    },
    cancel: function() {
      this.transitionTo('clients');
      return true;
    },
    registerDone: function() {
      this.transitionTo('clients');
      return true;
    },
  },
  setupController: function(controller, model) {
    controller.set('model', model);
  },
  model: function() {
    this.controllerFor('client.register').set('registrationSuccess', false);
    return this.store.createRecord('client', {});
  },
  deactivate: function() {
    var model = this.controllerFor('client.register').get('model');
    model.rollbackAttributes();
  },
  error: function(/*error , transition*/) {
    // if there is an error fetching the client list
    // then for now just invalidate the session
    this.get('session').invalidate();
  },
});
