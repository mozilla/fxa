import Ember from 'ember';

export var initialize = function(container, application) {
  Ember.A(['adapter', 'controller', 'route']).forEach(function(component) {
    application.inject(component, 'session', 'simple-auth-session:main');
  });
};

export default {
  name: 'application',

  initialize: initialize
};
