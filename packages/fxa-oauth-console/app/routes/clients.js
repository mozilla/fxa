/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Client from '../models/client';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  session: Ember.inject.service('session'),
  actions: {
    goToNewClient: function() {
      this.transitionTo('client.register');
    },
    goToClientDelete: function(model) {
      this.transitionTo('client.delete', model);
    },
    goToScopedToken: function() {
      this.transitionTo('clients.token');
    },
    goToClient: function(id) {
      // unload all stored client data to make sure we fetch the client again in the client view
      this.store.unloadAll('client');
      this.transitionTo('client', id);
    },
    update: function(model) {
      this.transitionTo('client.update', model);
    },
    create: function(model) {
      this.storage.create(model);
      this.transitionTo('clients');
    },
    updated: function(model) {
      this.storage.update(model);
      this.transitionTo('clients');
    },
    cancel: function(model) {
      Ember.run(model, 'destroy');
      this.storage.refresh(Client);
      this.transitionTo('clients');
    },
    error: function(/*error , transition*/) {
      // if there is an error fetching the client list
      // then for now just invalidate the session
      this.get('session').invalidate();
    },
  },
  model: function() {
    return this.store.findAll('client');
  },
});
