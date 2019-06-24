/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  actions: {
    update: function() {
      var self = this;
      var model = this.controllerFor('client.update').get('model');

      return model.save().then(function() {
        self.transitionTo('client.index', model.id);
      });
    },
    cancel: function() {
      return this.transitionTo('clients');
    },
  },
  deactivate: function() {
    var model = this.controllerFor('client.update').get('model');
    model.rollbackAttributes();
  },
});
