import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';
import Client from '../models/client';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  actions: {
    goToNewClient: function () {
      this.transitionTo('client.register');
    },
    goToClient: function( id ) {
      // unload all stored client data to make sure we fetch the client again in the client view
      this.store.unloadAll('client');
      this.transitionTo('client', id);
    },
    update: function (model) {
      this.transitionTo('client.update', model);
    },
    create: function (model) {
      this.storage.create(model);
      this.transitionTo('clients');
    },
    updated: function (model) {
      this.storage.update(model);
      this.transitionTo('clients');
    },
    remove: function (id) {
      console.log(id);
      return this.store.find('client', id).then(function (client) {
        console.log(client);
        client.destroyRecord();
      });
    },
    cancel: function (model) {
      Ember.run(model, "destroy");
      this.storage.refresh(Client);
      this.transitionTo('clients');
    },
    error: function(/*error, transition*/) {
      this.transitionTo('login');
    }
  },
  model: function () {
    return this.store.findAll('client');
  }
});

