import Ember from 'ember';
import config from '../config/environment';

export default Ember.Controller.extend({
  server: config.servers.oauth.replace('https://', '').replace('http://', '')
});
