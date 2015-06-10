/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * stringify and parse the `resume` token that is set in the URL
 * search parameters post-verification in the OAuth flow
 */

define([
  'backbone',
  'underscore'
], function (Backbone, _) {
  'use strict';

  function parse(resumeToken) {
    try {
      return JSON.parse(atob(resumeToken));
    } catch(e) {
      // do nothing, its an invalid token.
    }
  }

  function stringify(resumeObj) {
    var encoded = btoa(JSON.stringify(resumeObj));
    return encoded;
  }

  var ResumeToken = Backbone.Model.extend({
    defaults: {
      // fields from a relier
      state: undefined,
      verificationRedirect: undefined
    },

    initialize: function (options) {
      this.allowedKeys = Object.keys(this.defaults);

      // get rid of any data in the options block that is not expected.
      this.clear();

      var allowedData = _.pick(options, this.allowedKeys);
      this.set(allowedData);
    },

    stringify: function () {
      return stringify(this.pick(this.allowedKeys));
    }
  });

  // static methods on the ResumeToken object itself, not its prototype.
  _.extend(ResumeToken, {
    parse: parse,
    stringify: stringify
  });

  return ResumeToken;
});

