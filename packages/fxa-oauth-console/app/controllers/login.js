import Ember from 'ember';
import LoginControllerMixin from 'simple-auth/mixins/login-controller-mixin';

export default Ember.Controller.extend(LoginControllerMixin, {
  authenticator: 'authenticator:custom',
  actions: {
    // display an error when authentication fails
    authenticate: function() {
      var _this = this;

      this._super().then(null, function(message) {
        _this.set('errorMessage', message);
      });
    }
  }
});
