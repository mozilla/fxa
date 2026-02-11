/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Get the user agent string, or a user agent parser.
 *
 * Requires `this.window` to be set.
 */

import UrlMixin from './url-mixin';
import UserAgent from './user-agent';

export default {
  dependsOn: [UrlMixin],

  /**
   * Get the user-agent string. For functional testing
   * purposes, first attempts to fetch a UA string from the
   * `forceUA` query parameter, if that is not found, use
   * the browser's.
   *
   * @returns {String}
   */
  getUserAgentString() {
    return this.getSearchParam('forceUA') || this.window.navigator.userAgent;
  },

  /**
   * Get a UserAgent instance.
   *
   * @param {String} [userAgent] - user agent string.
   *   Defaults to result of this.getUserAgentString()
   * @returns {Object}
   */
  getUserAgent(userAgent = this.getUserAgentString()) {
    return new UserAgent(userAgent);
  },
};
