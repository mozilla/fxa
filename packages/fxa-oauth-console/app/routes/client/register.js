/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  actions: {
    create: function(model) {
      return model.save();
    },
    cancel: function() {
      this.transitionTo('clients');
      return true;
    }
  },
  model: function() {
    return this.store.createRecord('client', {});
  }
});
