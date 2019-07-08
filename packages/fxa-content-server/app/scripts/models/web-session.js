/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Web Session information
 */
import Backbone from 'backbone';
import Constants from '../lib/constants';

export default Backbone.Model.extend({
  defaults: {
    approximateLastAccessTime: null,
    approximateLastAccessTimeFormatted: null,
    clientType: Constants.CLIENT_TYPE_WEB_SESSION,
    genericOS: null,
    id: null,
    lastAccessTime: null,
    lastAccessTimeFormatted: null,
    name: null,
    userAgent: null,
  },

  destroy() {
    this.trigger('destroy', this);
  },
});
