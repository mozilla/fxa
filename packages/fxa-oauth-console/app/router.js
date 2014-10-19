import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function () {
  this.route('login');

  this.route('clients', {path: '/clients'});
  this.route('client.register',  {path:'/client/register'});
  this.resource('client', {path: '/client/:client_id'}, function () {
    this.route('update');
  });
});

export default Router;
