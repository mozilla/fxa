/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * V2 of the FxFirstrun broker
 *
 * Enable syncPreferencesNotification on the verification complete screen.
 */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var FxFirstrunV1AuthenticationBroker = require('./fx-firstrun-v1');

  var proto = FxFirstrunV1AuthenticationBroker.prototype;

  var FxFirstrunV2AuthenticationBroker = FxFirstrunV1AuthenticationBroker.extend({
    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      chooseWhatToSyncCheckbox: false,
      chooseWhatToSyncWebV1: {
        engines: [
          'bookmarks',
          'history',
          'passwords',
          'tabs',
          'desktop-addons',
          'desktop-preferences'
        ]
      },
      syncPreferencesNotification: true
    }),

    type: 'fx-firstrun-v2'
  });

  module.exports = FxFirstrunV2AuthenticationBroker;
});

