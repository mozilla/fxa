/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// utilities to deal with urls

import _ from 'underscore';

export default {
  /**
   * Convert a search string to its object representation, one entry
   * per query parameter. Assumes the string is a search string and
   * not a full URL without a search string.
   *
   * @param {String} [str=''] - string to convert
   * @param {String[]} [allowedFields] - list of allowed fields. If not
   * declared, all fields are allowed.
   * @returns {Object}
   */
  searchParams(str = '', allowedFields) {
    // ditch everything before the ? and from # to the end
    const search = str.replace(/(^.*\?|#.*$)/g, '').trim();
    if (!search) {
      return {};
    }

    return this.splitEncodedParams(search, allowedFields);
  },

  /**
   * Return the value of a single query parameter in the string
   *
   * @param {String} name - name of the query parameter
   * @param {String} [str=''] - search string
   * @returns {String}
   */
  searchParam(name, str) {
    return this.searchParams(str)[name];
  },

  /**
   * Convert a hash string to its object representation, one entry
   * per query parameter
   *
   * @param {String} [str=''] - string to convert
   * @param {String[]} [allowedFields=[]] - list of allowed fields. If not
   * declared, all fields are allowed.
   * @returns {Object}
   */
  hashParams(str = '', allowedFields) {
    // ditch everything before the #
    const hash = str.replace(/^.*#/, '').trim();
    if (!hash) {
      return {};
    }

    return this.splitEncodedParams(hash, allowedFields);
  },

  /**
   * Convert a URI encoded string to its object representation.
   *
   * `&` is the expected delimiter between parameters.
   * `=` is the delimiter between a key and a value.
   *
   * @param {String} [str=''] string to split
   * @param {String[]} [allowedFields=[]] - list of allowed fields. If not
   * declared, all fields are allowed.
   * @returns {Object}
   */
  splitEncodedParams(str = '', allowedFields) {
    const pairs = str.split('&');
    const terms = {};

    _.each(pairs, (pair) => {
      const [key, value] = pair.split('=');
      terms[key] = decodeURIComponent(value).trim();
    });

    if (!allowedFields) {
      return terms;
    }

    return _.pick(terms, allowedFields);
  },

  /**
   * Convert an object to a search string.
   *
   * @param {Object} [obj={}] - object to convert
   * @returns {String}
   */
  objToSearchString(obj) {
    return this.objToUrlString(obj, '?');
  },

  /**
   * Convert an object to a hash string.
   *
   * @param {Object} [obj={}] - object to convert
   * @returns {String}
   */
  objToHashString(obj) {
    return this.objToUrlString(obj, '#');
  },

  /**
   * Recursively break an object down in to query string key/values.
   * Supplementary to objToUrlString.
   *
   * @param {Object} [obj={}] - object to break down
   * @param {Array} [keys=[]] - existing keys to supply to the pairing
   * @returns {Array}
   */
  _getObjPairs(obj = {}, keys = []) {
    return Object.entries(obj || {}).reduce((pairs, [key, value]) => {
      if (typeof value === 'object') {
        pairs.push(...this._getObjPairs(value, [...keys, key]));
      } else if (value != null) {
        pairs.push([[...keys, key], value]);
      }
      return pairs;
    }, []);
  },

  /**
   * Convert an object to a URL safe string
   *
   * @param {Object} [obj={}] - object to convert
   * @param {String} [prefix='?'] - prefix to append
   * @returns {String}
   */
  objToUrlString(obj = {}, prefix = '?') {
    const params = this._getObjPairs(obj)
      .map(([[key0, ...keysRest], value]) => {
        value = value.toString();
        if (value.length) {
          return `${key0}${keysRest
            .map((a) => `[${a}]`)
            .join('')}=${encodeURIComponent(value)}`;
        }
      })
      .filter((p) => !!p);

    if (!params.length) {
      return '';
    }

    return prefix + params.join('&');
  },

  /**
   * Get the origin portion of the URL
   *
   * @param {String} url
   * @returns {String}
   */
  getOrigin(url) {
    if (!url) {
      return '';
    }

    // The URL API is only supported by new browsers, a workaround is used.
    const anchor = document.createElement('a');

    // Fx 18 (& FxOS 1.*) do not support anchor.origin. Build the origin
    // out of the protocol and host.
    // Use setAttribute instead of a direct set or else Fx18 does not
    // update anchor.protocol & anchor.host.
    anchor.setAttribute('href', url);

    if (!(anchor.protocol && anchor.host)) {
      // malformed URL. Return null. This is the same behavior as URL.origin
      return null;
    }

    // IE10 always returns port, Firefox and Chrome hide the port if it is the default port e.g 443, 80
    // We normalize IE10 output, use the hostname if it is a default port to match Firefox and Chrome.
    // Also IE10 returns anchor.port as String, Firefox and Chrome use Number.
    const host =
      Number(anchor.port) === 443 || Number(anchor.port) === 80
        ? anchor.hostname
        : anchor.host;
    const origin = anchor.protocol + '//' + host;

    // if only the domain is specified without a protocol, the anchor
    // will use the page's origin as the URL's origin. Check that
    // the created origin matches the first portion of
    // the passed in URL. If not, then the anchor element
    // modified the origin.
    if (url.indexOf(origin) !== 0) {
      return null;
    }

    return origin;
  },

  /**
   * Update the search string in the given URL.
   *
   * @param {String} uri - uri to update
   * @param {Object} newParams
   * @returns {String}
   */
  updateSearchString(uri, newParams) {
    let params = {};
    const startOfParams = uri.indexOf('?');
    if (startOfParams >= 0) {
      params = this.searchParams(uri.substring(startOfParams + 1));
      uri = uri.substring(0, startOfParams);
    }
    _.extend(params, newParams);
    return uri + this.objToSearchString(params);
  },

  /**
   * Clean the search string by only allowing search parameters declared in
   * `allowedFields`
   *
   * @param {String} uri - uri with search string to clean.
   * @param {String[]} allowedFields - list of allowed fields.
   * @returns {String}
   */
  cleanSearchString(uri, allowedFields) {
    const [base, search = ''] = uri.split('?');
    const cleanedQueryParams = this.searchParams(search, allowedFields);
    return base + this.objToSearchString(cleanedQueryParams);
  },

  /**
   * Set a new value for the query search string in place. This does
   * not reload the page but rather updates the window state history.
   *
   * @param {String} param - param to update
   * @param {String} value - value to set
   */
  setSearchString(param, value) {
    const params = new URLSearchParams(this.window.location.search);
    params.set(param, value);

    // This will update the url with new params inplace
    this.window.history.replaceState(
      {},
      '',
      `${this.window.location.pathname}?${params}`
    );
  },
};
