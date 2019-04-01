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

'use strict';

const Backbone = require('backbone');
const Cocktail = require('cocktail');
const ResumeTokenMixin = require('./mixins/resume-token');
const UrlMixin = require('./mixins/url');
const Storage = require('../lib/storage');
const uuid = require('uuid');

var Model = Backbone.Model.extend({
  initialize (options) {
    options = options || {};

    this.sentryMetrics = options.sentryMetrics;
    this.window = options.window || window;

    this.fetch();
  },

  defaults: {
    uniqueUserId: null
  },

  fetch () {
    // Try to fetch the uniqueUserId from the resume token.
    // If unavailable there, fetch from localStorage.
    // If not in localStorage either, create a new uniqueUserId.

    var storage = Storage.factory('localStorage', this.window);

    this.populateFromStringifiedResumeToken(this.getSearchParam('resume'));

    var uniqueUserId = this.get('uniqueUserId');
    if (! uniqueUserId) {
      if (storage.get('uniqueUserId')) {
        // uniqueUserId is the new name.
        uniqueUserId = storage.get('uniqueUserId');
      } else {
        uniqueUserId = uuid.v4();
      }
    }

    this.set('uniqueUserId', uniqueUserId);
    storage.set('uniqueUserId', uniqueUserId);
  },

  resumeTokenFields: ['uniqueUserId']
});

Cocktail.mixin(
  Model,
  ResumeTokenMixin,
  UrlMixin
);

module.exports = Model;
