import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';
import Client from '../../models/client';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  actions: {
    create: function(model) {
      model.save();
    },
    cancel: function() {
      this.transitionTo('clients');
      return true;
    }
  },
  model: function() {
    return this.store.createRecord('client', {});
  }
});
