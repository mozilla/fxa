/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A model to represent a UUID value that is unrelated to any
 * account information. This is useful to determine if a logged
 * out user qualifies for A/B testing or metrics or to tie a user's
 * metrics together pre and post-verification.
 *
 * This model is generally not used directly, instead the final value
 * is set on the User model and fetched from there. This model exists
 * because value initialization is complex.
 *
 * Try to fetch the uniqueUserId from the resume token.
 * If unavailable there, fetch from localStorage.
 * If not in localStorage either, create a new uniqueUserId.
 */

define(function (require, exports, module) {
  'use strict';

  var Backbone = require('backbone');
  var Cocktail = require('cocktail');
  var ResumeTokenMixin = require('models/mixins/resume-token');
  var SearchParamMixin = require('models/mixins/search-param');
  var Storage = require('lib/storage');
  var uuid = require('uuid');

  var Model = Backbone.Model.extend({
    initialize: function (options) {
      options = options || {};

      this.sentryMetrics = options.sentryMetrics;
      this.window = options.window || window;

      this.fetch();
    },

    defaults: {
      uniqueUserId: null
    },

    fetch: function () {
      // Try to fetch the uniqueUserId from the resume token.
      // If unavailable there, fetch from localStorage.
      // If not in localStorage either, create a new uniqueUserId.

      var self = this;
      var storage = Storage.factory('localStorage', self.window);

      self.populateFromStringifiedResumeToken(self.getSearchParam('resume'));

      var uniqueUserId = self.get('uniqueUserId');
      if (! uniqueUserId) {
        if (storage.get('uuid')) {
          // stomlinson on 2015-07-08:
          // `uuid` is the old name, this is transition code
          // and can hopefully be removed after a time.
          uniqueUserId = storage.get('uuid');
          storage.remove('uuid');
        } else if (storage.get('uniqueUserId')) {
          // uniqueUserId is the new name.
          uniqueUserId = storage.get('uniqueUserId');
        } else {
          uniqueUserId = uuid.v4();
        }
      }

      self.set('uniqueUserId', uniqueUserId);
      storage.set('uniqueUserId', uniqueUserId);
    },

    resumeTokenFields: ['uniqueUserId']
  });

  Cocktail.mixin(
    Model,
    ResumeTokenMixin,
    SearchParamMixin
  );

  module.exports = Model;
});
