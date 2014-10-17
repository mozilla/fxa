import Ember from 'ember';
import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  serializeIntoHash: function(hash, type, record, options) {
    Ember.merge(hash, this.serialize(record, options));
  }
});
