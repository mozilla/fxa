/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    remove: function (id) {
      var self = this;

      return this.store.find('client', id).then(function (client) {
        client.destroyRecord().then(function() {
          self.transitionTo('clients');
        });
      });
    }
  }
});
