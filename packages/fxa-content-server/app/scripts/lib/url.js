/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// utilities to deal with urls
'use strict';

define(['underscore'],
function (_) {
  return {
    searchParam: function (name, str) {
      var search = (str || window.location.search).replace(/^\?/, '');
      if (! search) {
        return;
      }

      var pairs = search.split('&');
      var terms = {};

      _.each(pairs, function (pair) {
        var keyValue = pair.split('=');
        terms[keyValue[0]] = decodeURIComponent(keyValue[1]);
      });

      return terms[name];
    }
  };
});

