/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Attached clients are OAuth apps and devices
 *
 * It sorts items in order that is defined in FxA-89 feature description.
 */
import Backbone from 'backbone';
import Constants from '../lib/constants';
import Device from './device';
import OAuthApp from './oauth-app';
import WebSession from './web-session';

var AttachedClients = Backbone.Collection.extend({
  model: function(attrs, options) {
    if (attrs.clientType === Constants.CLIENT_TYPE_DEVICE) {
      return new Device(attrs, options);
    } else if (attrs.clientType === Constants.CLIENT_TYPE_OAUTH_APP) {
      return new OAuthApp(attrs, options);
    } else if (attrs.clientType === Constants.CLIENT_TYPE_WEB_SESSION) {
      return new WebSession(attrs, options);
    }
  },

  fetchClients(clientTypes = {}, user) {
    var account = user.getSignedInAccount();
    var fetchItems = [];

    if (clientTypes.devices) {
      fetchItems.push(user.fetchAccountDevices(account));
    }

    if (clientTypes.oAuthApps) {
      fetchItems.push(user.fetchAccountOAuthApps(account));
    }

    if (clientTypes.sessions) {
      fetchItems.push(user.fetchAccountSessions(account));
    }

    return Promise.all(fetchItems).then(results => {
      // need to reset and sync add the models,
      // Backbone cannot merge two simultaneous responses.
      this.reset();
      if (results) {
        results.forEach(items => {
          this.add(items, {
            merge: true,
          });
        });
      }
    });
  },

  comparator(a, b) {
    // 1. the current device is first.
    // 2. devices of the same type are grouped together as defined in clientOrder.
    // 3. those with lastAccessTime are sorted in descending order
    // 4. the rest sorted in alphabetical order.
    if (a.get('isCurrentDevice')) {
      return -1;
    }
    if (b.get('isCurrentDevice')) {
      return 1;
    }

    var clientOrder = {
      [Constants.CLIENT_TYPE_DEVICE]: 0,
      [Constants.CLIENT_TYPE_OAUTH_APP]: 1,
      [Constants.CLIENT_TYPE_WEB_SESSION]: 2,
    };

    var aClientType = a.get('clientType');
    var bClientType = b.get('clientType');
    if (aClientType !== bClientType) {
      return clientOrder[aClientType] - clientOrder[bClientType];
    }

    // check lastAccessTime. If one has an access time and the other does
    // not, the one with the access time is automatically higher in the
    // list. If both have access times, sort in descending order, unless
    // access times are the same, then sort alphabetically.
    var aLastAccessTime = a.get('lastAccessTime');
    var bLastAccessTime = b.get('lastAccessTime');

    if (aLastAccessTime !== bLastAccessTime) {
      return bLastAccessTime - aLastAccessTime;
    } else if (aLastAccessTime && !bLastAccessTime) {
      return -1;
    } else if (!aLastAccessTime && bLastAccessTime) {
      return 1;
    }

    // if access time is the same,
    // sort alphabetically
    var aName = (a.get('name') || '').trim().toLowerCase();
    var bName = (b.get('name') || '').trim().toLowerCase();

    if (aName < bName) {
      return -1;
    } else if (aName > bName) {
      return 1;
    }

    return 0;
  },
});

export default AttachedClients;
