/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A relier is a model that holds information about the RP.
 *
 * A subclass should override `resumeTokenFields` to add/modify which
 * fields are saved to and populated from a resume token in the resume
 * query parameter.
 */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var BaseRelier = require('models/reliers/base');
  var Cocktail = require('cocktail');
  var Constants = require('lib/constants');
  var p = require('lib/promise');
  var ResumeTokenMixin = require('models/mixins/resume-token');
  var SearchParamMixin = require('models/mixins/search-param');
  var Vat = require('lib/vat');

  var RELIER_FIELDS_IN_RESUME_TOKEN = [
    'campaign',
    'entrypoint',
    'resetPasswordConfirm',
    'utmCampaign',
    'utmContent',
    'utmMedium',
    'utmSource',
    'utmTerm'
  ];

  /*eslint-disable camelcase*/
  var QUERY_PARAMETER_SCHEMA = {
    campaign: Vat.string(),
    // `email` will be further validated by views to
    // show the appropriate error message
    email: Vat.string().allow(Constants.DISALLOW_CACHED_CREDENTIALS),
    // FxDesktop declares both `entryPoint` (capital P) and
    // `entrypoint` (lowcase p). Normalize to `entrypoint`.
    entryPoint: Vat.string(),
    entrypoint: Vat.string(),
    migration: Vat.string().valid(Constants.AMO_MIGRATION, Constants.SYNC11_MIGRATION),
    preVerifyToken: Vat.base64jwt(),
    reset_password_confirm: Vat.boolean().renameTo('resetPasswordConfirm'),
    service: Vat.string(),
    setting: Vat.string(),
    // `uid` will be further validated by the views to
    // show the appropriate error message
    uid: Vat.string(),
    utm_campaign: Vat.string().renameTo('utmCampaign'),
    utm_content: Vat.string().renameTo('utmContent'),
    utm_medium: Vat.string().renameTo('utmMedium'),
    utm_source: Vat.string().renameTo('utmSource'),
    utm_term: Vat.string().renameTo('utmTerm')
  };
  /*eslint-enable camelcase*/

  var Relier = BaseRelier.extend({
    defaults: {
      allowCachedCredentials: true,
      campaign: null,
      email: null,
      entrypoint: null,
      migration: null,
      preVerifyToken: null,
      resetPasswordConfirm: true,
      service: null,
      setting: null,
      uid: null,
      utmCampaign: null,
      utmContent: null,
      utmMedium: null,
      utmSource: null,
      utmTerm: null
    },

    initialize: function (options) {
      options = options || {};

      this.sentryMetrics = options.sentryMetrics;
      this.window = options.window || window;
    },

    /**
     * Hydrate the model. Returns a promise to allow
     * for an asynchronous load. Sub-classes that override
     * fetch should still call Relier's version before completing.
     *
     * e.g.
     *
     * fetch: function () {
     *   return Relier.prototype.fetch.call(this)
     *       .then(function () {
     *         // do overriding behavior here.
     *       });
     * }
     *
     * @method fetch
     */
    fetch: function () {
      var self = this;
      return p()
        .then(function () {
          // parse the resume token before importing any other data.
          // query parameters and server provided data override
          // resume provided data.
          self.populateFromStringifiedResumeToken(self.getSearchParam('resume'));
          // TODO - validate data coming from the resume token

          self.importSearchParamsUsingSchema(QUERY_PARAMETER_SCHEMA, AuthErrors);

          // FxDesktop declares both `entryPoint` (capital P) and
          // `entrypoint` (lowcase p). Normalize to `entrypoint`.
          if (self.has('entryPoint') && ! self.has('entrypoint')) {
            self.set('entrypoint', self.get('entryPoint'));
          }

          if (self.get('email') === Constants.DISALLOW_CACHED_CREDENTIALS) {
            self.unset('email');
            self.set('allowCachedCredentials', false);
          }
        });
    },

    /**
     * Check if the relier allows cached credentials. A relier
     * can set email=blank to indicate they do not.
     */
    allowCachedCredentials: function () {
      return this.get('allowCachedCredentials');
    },

    resumeTokenFields: RELIER_FIELDS_IN_RESUME_TOKEN
  });

  Cocktail.mixin(
    Relier,
    ResumeTokenMixin,
    SearchParamMixin
  );

  module.exports = Relier;
});
