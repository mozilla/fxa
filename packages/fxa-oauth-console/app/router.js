import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('login');
  this.resource("server", function() {
    this.route('view', { path: '/:server_id' });
  });

});

export default Router;
