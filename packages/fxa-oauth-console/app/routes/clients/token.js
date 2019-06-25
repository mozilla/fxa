/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import config from '../../config/environment';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  setupController: function(controller, model, queryParams) {
    controller.set(
      'access_token',
      queryParams.state.fullQueryParams.access_token
    );
    controller.set('scopes', queryParams.state.fullQueryParams.scopes);
  },
  actions: {
    /**
     * Requests a fresh OAuth bearer token by asking the user to login again.
     */
    requestToken: function() {
      var tokenUrl = config.baseURL + 'oauth/generate-token';
      var form = Ember.$('<form />', {
        action: tokenUrl,
        method: 'POST',
      });
      form.append(
        '<input type=hidden name=scopes value="' +
          Ember.$('#scopes').val() +
          '" />'
      );
      form.appendTo('body').submit();
    },
  },
});
