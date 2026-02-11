/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Attached Client (Device, Session or OAuth) information
 */

import Backbone from 'backbone';
import Constants from '../lib/constants';
import UserAgent from '../lib/user-agent';

var AttachedClient = Backbone.Model.extend({
  defaults: {
    approximateLastAccessTime: null,
    approximateLastAccessTimeFormatted: null,
    clientId: null,
    clientType: null,
    createdTime: null,
    createdTimeFormatted: null,
    deviceId: null,
    deviceType: null,
    genericOS: null,
    id: null,
    isCurrentSession: false,
    isDevice: false,
    isOAuthApp: false,
    isWebSession: false,
    lastAccessTime: null,
    lastAccessTimeFormatted: null,
    location: null,
    // Set the default name in case the name is blank.
    name: 'Firefox',
    refreshTokenId: null,
    scope: null,
    sessionTokenId: null,
    userAgent: null,
  },

  initialize(attrs = {}, options) {
    Backbone.Model.prototype.initialize.call(this, attrs, options);
    // Make a synthetic `id` attribute because attached clients don't have
    // a single stable unique identifier. This is kind of gross but it's only
    // for our internal use by backbone's collection infrastructure.
    this.set(
      'id',
      `${attrs.clientId || ''}-${attrs.deviceId || ''}-${
        attrs.refreshTokenId || ''
      }-${attrs.sessionTokenId || ''}`
    );
    this.set('genericOS', UserAgent.toGenericOSName(attrs.os));
    // Intuit additional type flags based on what IDs are present.
    if (attrs.deviceId) {
      this.set({
        clientType: Constants.CLIENT_TYPE_DEVICE,
        isDevice: true,
      });
    } else if (attrs.clientId) {
      this.set({
        clientType: Constants.CLIENT_TYPE_OAUTH_APP,
        isOAuthApp: true,
      });
    } else {
      this.set({
        clientType: Constants.CLIENT_TYPE_WEB_SESSION,
        isWebSession: true,
      });
    }
  },

  // The actual server call to destroy instances of `AttachedClient` happens in the
  // `Account` model, but we need to trigger an even to ensure we get properly
  // removed from the containing `AttachedClients` collection.
  destroy() {
    this.trigger('destroy', this);
  },
});

export default AttachedClient;
