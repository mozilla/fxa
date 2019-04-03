/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * V2 of the FxFirstrun broker
 *
 * It used to enable syncPreferencesNotification on the verification complete screen.
 * Issue #4250
 */

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
    'form.engaged': '_sendFormEngaged',
    'show-child-view': '_onShowChildView',
    'show-view': '_onShowView'
  }),

  _iframeCommands: _.extend({}, proto._iframeCommands, {
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
