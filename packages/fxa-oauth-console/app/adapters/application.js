import Ember from 'ember';
import DS from 'ember-data';
import config from '../config/environment';

export default DS.RESTAdapter.extend({
  namespace: 'v1',
  host: config.servers.oauth,
  headers: Ember.computed(function () {
    return {
      'Authorization': 'Bearer none'
    };
  })
});
