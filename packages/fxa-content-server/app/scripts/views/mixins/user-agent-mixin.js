/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


define((require, exports, module) => {
  'use strict';

  const UserAgent = require('lib/user-agent');

  module.exports = {
    /**
     * Get the user-agent string. For functional testing
     * purposes, first attempts to fetch a UA string from the
     * `forceUA` query parameter, if that is not found, use
     * the browser's.
     *
     * @returns {String}
     */
    getUserAgentString () {
      return this.getSearchParam('forceUA') || this.window.navigator.userAgent;
    },

    /**
     * Get a UserAgent instance.
     *
     * @returns {Object}
     */
    getUserAgent () {
      if (! this._uap) {
        const userAgent = this.getUserAgentString();
        this._uap = new UserAgent(userAgent);
      }
      return this._uap;
    }
  };
});
