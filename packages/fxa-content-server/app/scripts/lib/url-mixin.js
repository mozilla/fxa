/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A mixin that allows objects to get/import search and hash parameters.
 * Requires the object to have this.window.location.search and
 * this.window.location.hash
 */

import Url from './url';

export default {
  /**
   * Get a value from the URL search parameter
   *
   * @param {String} paramName - name of the search parameter to get
   * @returns {String}
   */
  getSearchParam(paramName) {
    return Url.searchParam(paramName, this.window.location.search);
  },

  /**
   * Get values from the URL search parameters.
   *
   * @param {String[]} paramNames - name of the search parameters
   * to get
   * @returns {Object}
   */
  getSearchParams(paramNames) {
    return Url.searchParams(this.window.location.search, paramNames);
  },

  /**
   * Get values from the URL hash parameters.
   *
   * @param {String[]} paramNames - name of the hash parameters
   * to get
   * @returns {Object}
   */
  getHashParams(paramNames) {
    return Url.hashParams(this.window.location.hash, paramNames);
  },

  /**
   * return the pathname of the window
   *
   * @returns {String}
   */
  getPathname() {
    return this.window.location.pathname;
  },
};
