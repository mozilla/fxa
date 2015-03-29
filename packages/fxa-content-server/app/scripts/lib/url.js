/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// utilities to deal with urls
'use strict';

define(['underscore'],
function (_) {

  function searchParams (str, whitelist) {
    var search = (str || window.location.search).replace(/^\?/, '');
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

  return {
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

      var origin = anchor.protocol + '//' + anchor.host;
      // if only the domain is specified without a protocol, the anchor
      // will use the page's origin as the URL's origin. Check that
      // the created origin matches the first portion of
      // the passed in URL. If not, then the anchor element
      // modified the origin.
      if (url.indexOf(origin) !== 0) {
        return null;
      }

      return origin;
    }
  };
});

