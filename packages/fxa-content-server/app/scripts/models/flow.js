/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A model to represent a login flow, holding the data that we
 * need to submit as part of our metrics when we perform actions
 * during the flow.
 *
 * Try to fetch the flowId and flowBegin from the resume token.
 * If unavailable there, fetch from data attributes in the DOM.
 */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var AuthErrors = require('lib/auth-errors');
  var Backbone = require('backbone');
  var Cocktail = require('cocktail');
  var ErrorUtils = require('lib/error-utils');
  var ResumeTokenMixin = require('models/mixins/resume-token');
  var SearchParamMixin = require('models/mixins/search-param');
  var vat = require('lib/vat');

  var Model = Backbone.Model.extend({
    initialize: function (options) {
      options = options || {};

      this.sentryMetrics = options.sentryMetrics;
      this.window = options.window || window;

      // We should either get both fields from the resume token, or neither.
      // Getting one without the other is an error.
      this.populateFromStringifiedResumeToken(this.getSearchParam('resume'));
      if (this.has('flowId')) {
        if (! this.has('flowBegin')) {
          this.logError(AuthErrors.toMissingResumeTokenPropertyError('flowBegin'));
        }
      } else if (this.has('flowBegin')) {
        this.logError(AuthErrors.toMissingResumeTokenPropertyError('flowId'));
      } else {
        this.populateFromDataAttribute('flowId');
        this.populateFromDataAttribute('flowBegin');
      }
    },

    defaults: {
      flowBegin: null,
      flowId: null
    },

    populateFromDataAttribute: function (attribute) {
      var data = $(this.window.document.body).data(attribute);
      if (! data) {
        this.logError(AuthErrors.toMissingDataAttributeError(attribute));
      } else {
        try {
          data = this.resumeTokenSchema[attribute].validate(data);
          this.set(attribute, data);
        } catch (err) {
          this.logError(AuthErrors.toInvalidDataAttributeError(attribute));
        }
      }
    },

    logError: function (error) {
      return ErrorUtils.captureError(error, this.sentryMetrics);
    },

    resumeTokenFields: ['flowId', 'flowBegin'],

    resumeTokenSchema: {
      flowBegin: vat.number().test(function (value) {
        // Integers only
        return value === Math.round(value);
      }),
      flowId: vat.hex().len(64)
    }
  });

  Cocktail.mixin(
    Model,
    ResumeTokenMixin,
    SearchParamMixin
  );

  module.exports = Model;
});
