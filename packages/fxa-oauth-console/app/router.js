import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('login');

  this.resource('clients',     {path:'/clients' });
  // create a new client
  this.resource('client.register',  {path:'/client/register'});
  // view client by id
  this.resource('client',      {path:'/client/:guid'}, function(){
    // edit a client by id
    this.route('update');
  });
});

export default Router;
