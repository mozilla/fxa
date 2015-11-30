/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*/

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var Cocktail = require('cocktail');
  var Devices = require('models/devices');
  var FormView = require('views/form');
  var Notifier = require('lib/channels/notifier');
  var preventDefaultThen = require('views/base').preventDefaultThen;
  var SettingsPanelMixin = require('views/mixins/settings-panel-mixin');
  var SignedOutNotificationMixin = require('views/mixins/signed-out-notification-mixin');
  var Template = require('stache!templates/settings/devices');
  var Url = require('lib/url');

  var DEVICE_REMOVED_ANIMATION_MS = 150;
  var DEVICES_SUPPORT_URL = 'https://support.mozilla.org/kb/fxa-managing-devices';
  var FIREFOX_DOWNLOAD_LINK = 'https://www.mozilla.org/firefox/new/?utm_source=accounts.firefox.com&utm_medium=referral&utm_campaign=fxa-devices';
  var FORCE_DEVICE_LIST_VIEW = 'forceDeviceList';

  var View = FormView.extend({
    template: Template,
    className: 'devices',
    viewName: 'settings.devices',

    initialize: function (options) {
      this._able = options.able;
      this._devices = options.devices;

      // An empty Devices instance is created to render the initial view.
      // Data is only fetched once the panel has been opened.
      if (! this._devices) {
        this._devices = new Devices([], {
          notifier: options.notifier
        });
      }

      var devices = this._devices;
      devices.on('add', this._onDeviceAdded.bind(this));
      devices.on('remove', this._onDeviceRemoved.bind(this));

      var notifier = options.notifier;
      notifier.on(Notifier.DEVICE_REFRESH, this._onRefreshDeviceList.bind(this));
    },

    context: function () {
      return {
        devices: this._devices.toJSON(),
        devicesSupportUrl: DEVICES_SUPPORT_URL,
        isPanelEnabled: this._isPanelEnabled(),
        isPanelOpen: this.isPanelOpen(),
        linkAndroid: FIREFOX_DOWNLOAD_LINK,
        linkIOS: FIREFOX_DOWNLOAD_LINK,
        linkLinux: FIREFOX_DOWNLOAD_LINK,
        linkOSX: FIREFOX_DOWNLOAD_LINK,
        linkWindows: FIREFOX_DOWNLOAD_LINK
      };
    },

    events: {
      'click .device-disconnect': preventDefaultThen('_onDisconnectDevice'),
      'click .devices-refresh': preventDefaultThen('_onRefreshDeviceList')
    },

    _isPanelEnabled: function () {
      return this._able.choose('deviceListVisible', {
        forceDeviceList: Url.searchParam(FORCE_DEVICE_LIST_VIEW, this.window.location.search)
      });
    },

    _onDeviceAdded: function () {
      this.render();
    },

    _onDeviceRemoved: function (device) {
      var id = device.get('id');
      var self = this;
      $('#' + id).slideUp(DEVICE_REMOVED_ANIMATION_MS, function () {
        // re-render in case the last device is removed and the
        // "no registered devices" message needs to be shown.
        self.render();
      });
    },

    _onDisconnectDevice: function (event) {
      this.logViewEvent('disconnect');
      var deviceId = $(event.currentTarget).attr('data-id');
      this._destroyDevice(deviceId);
    },

    _onRefreshDeviceList: function () {
      if (this.isPanelOpen()) {
        this.logViewEvent('refresh');
        // only refresh devices if panel is visible
        // if panel is hidden there is no point of fetching devices
        this._fetchDevices();
      }
    },

    openPanel: function () {
      this.logViewEvent('open');
      this._fetchDevices();
    },

    _fetchDevices: function () {
      var account = this.getSignedInAccount();

      return this.user.fetchAccountDevices(account, this._devices);
    },

    _destroyDevice: function (deviceId) {
      var self = this;
      var account = this.getSignedInAccount();
      var device = this._devices.get(deviceId);
      if (device) {
        this.user.destroyAccountDevice(account, device)
          .then(function () {
            if (device.get('isCurrentDevice')) {
              self.navigateToSignIn();
            }
          });
      }
    }
  });

  Cocktail.mixin(
    View,
    SettingsPanelMixin,
    SignedOutNotificationMixin
  );

  module.exports = View;
});

