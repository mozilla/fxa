import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function () {
  this.route('login');

  this.route('clients');
  this.resource('client', {path: '/client/:id'}, function () {
    this.route('view');
    this.route('register');
    this.route('update');
  });
});

export default Router;
