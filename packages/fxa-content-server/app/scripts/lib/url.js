/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// utilities to deal with urls

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');

  function searchParams (str, whitelist) {
    var search = (typeof str === 'string' ? str : window.location.search).replace(/^\?/, '');
    if (! search) {
      return {};
    }

    var pairs = search.split('&');
    var terms = {};

    _.each(pairs, function (pair) {
      var keyValue = pair.split('=');
      terms[keyValue[0]] = decodeURIComponent(keyValue[1]);
    });

    if (! whitelist) {
      return terms;
    }

    // whitelist is in effect.
    var allowedTerms = {};

    _.each(whitelist, function (allowedTerm) {
      if (allowedTerm in terms) {
        allowedTerms[allowedTerm] = terms[allowedTerm];
      }
    });

    return allowedTerms;
  }

  module.exports = {
    searchParams: searchParams,
    searchParam: function (name, str) {
      var terms = searchParams(str);

      return terms[name];
    },

    objToSearchString: function (obj) {
      var params = [];
      for (var paramName in obj) {
        var paramValue = obj[paramName];
        if (typeof paramValue !== 'undefined') {
          params.push(paramName + '=' + encodeURIComponent(paramValue));
        }
      }

      if (! params.length) {
        return '';
      }
      return '?' + params.join('&');
    },

    getOrigin: function (url) {
      // The URL API is only supported by new browsers, a workaround is used.
      var anchor = document.createElement('a');

      // Fx 18 (& FxOS 1.*) do not support anchor.origin. Build the origin
      // out of the protocol and host.
      // Use setAttibute instead of a direct set or else Fx18 does not
      // update anchor.protocol & anchor.host.
      anchor.setAttribute('href', url);

      if (! (anchor.protocol && anchor.host)) {
        // malformed URL. Return null. This is the same behavior as URL.origin
        return null;
      }

      // IE10 always returns port, Firefox and Chrome hide the port if it is the default port e.g 443, 80
      // We normalize IE10 output, use the hostname if it is a default port to match Firefox and Chrome.
      // Also IE10 returns anchor.port as String, Firefox and Chrome use Number.
      var host = Number(anchor.port) === 443 || Number(anchor.port) === 80 ? anchor.hostname : anchor.host;
      var origin = anchor.protocol + '//' + host;

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
     * Returns true if given "uri" has HTTP or HTTPS scheme so it is navigable
     *
     * @param {String} uri
     * @returns {boolean}
     */
    isNavigable: function (uri) {
      // validate that that given 'uri' is 'http:// or https://' and has characters after the protocol
      return /^https?:\/\/\w+/i.test(uri);
    },

    removeParamFromSearchString: function (name, str) {
      var params = this.searchParams(str);
      delete params[name];
      return this.objToSearchString(params);
    },

    updateSearchString: function (uri, newParams) {
      var params = {};
      var startOfParams = uri.indexOf('?');
      if (startOfParams >= 0) {
        params = this.searchParams(uri.substring(startOfParams + 1));
        uri = uri.substring(0, startOfParams);
      }
      _.extend(params, newParams);
      return uri + this.objToSearchString(params);
    }
  };
});

