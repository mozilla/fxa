import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  actions: {
    create: function(model) {
      return model.save();
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
