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


const $ = require('jquery');
const AuthErrors = require('../lib/auth-errors');
const Backbone = require('backbone');
const Cocktail = require('cocktail');
const ErrorUtils = require('../lib/error-utils');
const ResumeTokenMixin = require('./mixins/resume-token');
const UrlMixin = require('./mixins/url');
const vat = require('../lib/vat');
const Url = require('../lib/url');

var Model = Backbone.Model.extend({
  initialize (options) {
    options = options || {};

    this.sentryMetrics = options.sentryMetrics;
    this.window = options.window || window;
    this.metrics = options.metrics;
    const urlParams = Url.searchParams(this.window.location.search);
    // We should either get both fields from the resume token, or neither.
    // Getting one without the other is an error.
    this.populateFromStringifiedResumeToken(this.getSearchParam('resume'));
    if (this.has('flowId')) {
      if (! this.has('flowBegin')) {
        this.logError(AuthErrors.toMissingResumeTokenPropertyError('flowBegin'));
      }
    } else if (this.has('flowBegin')) {
      this.logError(AuthErrors.toMissingResumeTokenPropertyError('flowId'));
    } else if (urlParams.flow_begin_time && urlParams.flow_id) {
      this.set('flowId', urlParams.flow_id);
      this.set('flowBegin', urlParams.flow_begin_time);
      // if the urlParams are set that means flow.begin was already logged on the server-side
      // therefore we mark flow.begin logged
      this.metrics.markEventLogged('flow.begin');
    } else {
      this.populateFromDataAttribute('flowId');
      this.populateFromDataAttribute('flowBegin');
    }
  },

  defaults: {
    flowBegin: null,
    flowId: null
  },

  populateFromDataAttribute (attribute) {
    var data = $(this.window.document.body).data(attribute);
    if (! data) {
      this.logError(AuthErrors.toMissingDataAttributeError(attribute));
    } else {
      const result = this.resumeTokenSchema[attribute].validate(data);
      if (result.error) {
        this.logError(AuthErrors.toInvalidDataAttributeError(attribute));
      } else {
        this.set(attribute, result.value);
      }
    }
  },

  logError (error) {
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
  UrlMixin
);

module.exports = Model;
