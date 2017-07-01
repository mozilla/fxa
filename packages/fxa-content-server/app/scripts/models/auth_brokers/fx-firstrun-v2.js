/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * V2 of the FxFirstrun broker
 *
 * It used to enable syncPreferencesNotification on the verification complete screen.
 * Issue #4250
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const FxFirstrunV1AuthenticationBroker = require('./fx-firstrun-v1');

  var proto = FxFirstrunV1AuthenticationBroker.prototype;

  var FxFirstrunV2AuthenticationBroker = FxFirstrunV1AuthenticationBroker.extend({
    type: 'fx-firstrun-v2',

    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      chooseWhatToSyncCheckbox: false,
      chooseWhatToSyncWebV1: true
    }),

    notifications: _.extend({}, proto.notifications, {
      'form.disabled': '_sendFormDisabled',
      'form.enabled': '_sendFormEnabled',
      'form.engaged': '_sendFormEngaged',
      'show-child-view': '_onShowChildView',
      'show-view': '_onShowView'
    }),

    _iframeCommands: _.extend({}, proto._iframeCommands, {
      FORM_DISABLED: 'form_disabled',
      FORM_ENABLED: 'form_enabled',
      FORM_ENGAGED: 'form_engaged',
      NAVIGATED: 'navigated'
    }),

    /**
     * Notify the parent the form has been modified.
     *
     * @private
     */
    _sendFormEngaged () {
      this._iframeChannel.send(this._iframeCommands.FORM_ENGAGED);
    },

    /**
     * Notify the parent the form has been disabled.
     *
     * @private
     */
    _sendFormDisabled () {
      this._iframeChannel.send(this._iframeCommands.FORM_DISABLED);
    },

    /**
     * Notify the parent the form has been enabled.
     *
     * @private
     */
    _sendFormEnabled () {
      this._iframeChannel.send(this._iframeCommands.FORM_ENABLED);
    },

    /**
     * Called whenever a View is displayed
     *
     * @param {Function} View constructor
     * @param {String} currentPage - URL being navigated to
     * @private
     */
    _onShowView (View, { currentPage }) {
      this._sendNavigated(currentPage);
    },

    /**
     * Notify the parent a view has been navigated to.
     *
     * @param {Function} ChildView constructor
     * @param {Function} ParentView constructor
     * @param {String} currentPage - URL being navigated to
     * @private
     */
    _onShowChildView (ChildView, ParentView, { currentPage }) {
      this._sendNavigated(currentPage);
    },

    /**
     * Notify the parent when the URL pathname has changed
     *
     * @param {String} url - URL being navigated to
     * @private
     */
    _sendNavigated (url) {
      this._iframeChannel.send(this._iframeCommands.NAVIGATED, { url });
    }
  });

  module.exports = FxFirstrunV2AuthenticationBroker;
});
