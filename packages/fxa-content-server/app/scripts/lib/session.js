/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore'
], function(_) {
    var RESERVED = [
      'get',
      'set',
      'clear'
    ];

    return {
      set: function(key, value) {
        if (typeof value === 'undefined' && typeof key === 'object') {
          return _.each(key, function(value, key) {
            this.set(key, value);
          }, this);
        }

        if (RESERVED.indexOf(key) === -1) {
          this[key] = value;
        }
      },

      get: function(key) {
        return this[key];
      },

      clear: function(key) {
        // no key specified, clear everything.
        if (typeof key === 'undefined') {
          for (var key in this) {
            this.clear(key);
          }
          return;
        }

        if (this.hasOwnProperty(key) && RESERVED.indexOf(key) === -1) {
          this[key] = null;
          delete this[key];
        }
      }
    };
  }
);
