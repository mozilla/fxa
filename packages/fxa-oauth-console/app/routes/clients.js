import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';
import Client from '../models/client';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  actions: {
    goToNewClient: function () {
      this.transitionTo('client.register');
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
    remove: function (model) {
      this.storage.remove(model);
    },
    cancel: function (model) {
      Ember.run(model, "destroy");
      this.storage.refresh(Client);
      this.transitionTo('clients');
    }
  },
  model: function () {
    return this.store.findAll('client');
  }
});

