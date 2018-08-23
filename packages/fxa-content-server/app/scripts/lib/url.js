/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// utilities to deal with urls

import _ from 'underscore';

module.exports = {
  /**
   * Convert a search string to its object representation, one entry
   * per query parameter
   *
   * @param {String} str - string to convert
   * @param {String[]} [allowedFields] - list of allowed fields. If not
   * declared, all fields are allowed.
   * @returns {Object}
   */
  searchParams (str, allowedFields) {
    const search = str.replace(/^\?/, '').trim();
    if (! search) {
      return {};
    }

    const pairs = search.split('&');
    const terms = {};

    _.each(pairs, (pair) => {
      const [key, value] = pair.split('=');
      terms[key] = decodeURIComponent(value).trim();
    });

    if (! allowedFields) {
      return terms;
    }

    return _.pick(terms, allowedFields);
  },

  /**
   * Return the value of a single query parameter in the string
   *
   * @param {String} name - name of the query parameter
   * @param {String} [str] - search string
   * @returns {String}
   */
  searchParam (name, str) {
    return this.searchParams(str)[name];
  },

  /**
   * Convert an object to a search string.
   *
   * @param {Object} obj - object to convert
   * @returns {String}
   */
  objToSearchString (obj) {
    const params = [];
    for (const paramName in obj) {
      const paramValue = obj[paramName];
      if (typeof paramValue !== 'undefined' && paramValue !== null) {
        params.push(paramName + '=' + encodeURIComponent(paramValue));
      }
    }

    if (! params.length) {
      return '';
    }
    return '?' + params.join('&');
  },

  /**
   * Get the origin portion of the URL
   *
   * @param {String} url
   * @returns {String}
   */
  getOrigin (url) {
    if (! url) {
      return '';
    }

    // The URL API is only supported by new browsers, a workaround is used.
    const anchor = document.createElement('a');

    // Fx 18 (& FxOS 1.*) do not support anchor.origin. Build the origin
    // out of the protocol and host.
    // Use setAttribute instead of a direct set or else Fx18 does not
    // update anchor.protocol & anchor.host.
    anchor.setAttribute('href', url);

    if (! (anchor.protocol && anchor.host)) {
      // malformed URL. Return null. This is the same behavior as URL.origin
      return null;
    }

    // IE10 always returns port, Firefox and Chrome hide the port if it is the default port e.g 443, 80
    // We normalize IE10 output, use the hostname if it is a default port to match Firefox and Chrome.
    // Also IE10 returns anchor.port as String, Firefox and Chrome use Number.
    const host = Number(anchor.port) === 443 || Number(anchor.port) === 80 ? anchor.hostname : anchor.host;
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
  updateSearchString (uri, newParams) {
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
  cleanSearchString (uri, allowedFields) {
    const [ base, search = '' ] = uri.split('?');
    const cleanedQueryParams =
        this.searchParams(search, allowedFields);
    return base + this.objToSearchString(cleanedQueryParams);
  }
};
