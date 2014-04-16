/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// an ephemeral messages model. Ephemeral messages are allowed
// a single `get` and no more.

'use strict';

define([
  'backbone'
], function (Backbone) {

  var Model = Backbone.Model.extend({
    get: function (attribute) {
      var value = Backbone.Model.prototype.get.apply(this, arguments);

      // only allow a single `get` for any `set`.
      this.unset(attribute);

      return value;
    }
  });

  return Model;
});

