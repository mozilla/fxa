/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Keeps track of OAuth tokens. Allows a consumer to destroy
 * OAuth tokens when no longer needed without the need to interace
 * with an Account model.
 */

import Backbone from 'backbone';

var Model = Backbone.Model.extend({
  defaults: {
    token: undefined,
  },

  initialize(options) {
    options = options || {};

    this._oAuthClient = options.oAuthClient;
    this.set('token', options.token);
  },

  destroy() {
    return this._oAuthClient.destroyToken(this.get('token'));
  },
});

export default Model;
