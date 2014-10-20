import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  redirect_uri: DS.attr('string'),
  image_uri: DS.attr('string'),
  client_secret: DS.attr('string'),
  can_grant: DS.attr('boolean'),
  whitelisted: DS.attr('boolean')
});
