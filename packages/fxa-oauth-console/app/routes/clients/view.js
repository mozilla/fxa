import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';
import Client from '../models/client';

var ClientRoute = Ember.Route.extend(AuthenticatedRouteMixin, {
  model: function (params) {
    return this.store.findQuery('client', params.id);
  }
});

export default ClientRoute;
