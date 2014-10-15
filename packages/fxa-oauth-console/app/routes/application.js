import Ember from 'ember';
import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  actions: {
    authenticateSession: function() {
      this.get('session').authenticate('authenticator:custom', {});
    },
   sessionAuthenticationFailed: function(/*error*/) {
      this.transitionTo('login');
    },
    sessionAuthenticationSucceeded: function() {
      this.transitionTo('index');
    }
  }
});
