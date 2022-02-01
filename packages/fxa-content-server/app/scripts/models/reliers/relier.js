/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A relier is a model that holds information about the relying party.
 *
 * A subclass should override `resumeTokenFields` to add/modify which
 * fields are saved to and populated from a resume token in the resume
 * query parameter.
 */

import _ from 'underscore';
import AuthErrors from '../../lib/auth-errors';
import BaseRelier from './base';
import Cocktail from 'cocktail';
import Constants from '../../lib/constants';
import ResumeTokenMixin from '../mixins/resume-token';
import UrlMixin from '../mixins/url';
import Vat from '../../lib/vat';
import xhr from '../../lib/xhr';

const t = (msg) => msg;

const SUBSCRIPTION_PRODUCT_ROUTE_RE = new RegExp(
  '/subscriptions/products/(.*)'
);

const RELIER_FIELDS_IN_RESUME_TOKEN = [
  'entrypoint',
  'entrypointExperiment',
  'entrypointVariation',
  'resetPasswordConfirm',
  'style',
  'utmCampaign',
  'utmContent',
  'utmMedium',
  'utmSource',
  'utmTerm',
];

/*eslint-disable camelcase*/
const QUERY_PARAMETER_SCHEMA = {
  action: Vat.action(),
  // Should only be used for testing. If set to false, COPPA is disabled
  coppa: Vat.boolean().renameTo('isCoppaEnabled'),
  // email is validated within fetch because it's handling depends on the action.
  // FxDesktop declares both `entryPoint` (capital P) and
  // `entrypoint` (lowcase p). Normalize to `entrypoint`.
  entryPoint: Vat.string(),
  entrypoint: Vat.string(),
  entrypoint_experiment: Vat.string().renameTo('entrypointExperiment'),
  entrypoint_variation: Vat.string().renameTo('entrypointVariation'),
  reset_password_confirm: Vat.boolean().renameTo('resetPasswordConfirm'),
  setting: Vat.string(),
  // During the subscription flow, the service param is populated so that we
  // can emit it correctly for metrics
  service: Vat.string(),
  style: Vat.string().valid(Constants.STYLE_TRAILHEAD), // deprecated but still valid
  uid: Vat.uid(),
  utm_campaign: Vat.string().renameTo('utmCampaign'),
  utm_content: Vat.string().renameTo('utmContent'),
  utm_medium: Vat.string().renameTo('utmMedium'),
  utm_source: Vat.string().renameTo('utmSource'),
  utm_term: Vat.string().renameTo('utmTerm'),
  // Flow params
  flow_id: Vat.string().renameTo('flowId'),
  flow_begin_time: Vat.string().renameTo('flowBeginTime'),
  device_id: Vat.string().renameTo('deviceId'),
};

const EMAIL_FIRST_EMAIL_SCHEMA = {
  email: Vat.string().allow(''),
};

const SIGNIN_SIGNUP_EMAIL_SCHEMA = {
  email: Vat.email(),
};

var VERIFICATION_QUERY_PARAMETER_SCHEMA = _.extend({}, QUERY_PARAMETER_SCHEMA, {
  // Verification links are sometimes broken by mail user-agents.
  // The rules on the following fields are relaxed for startup,
  // and then further validated by the views that use them. If
  // the fields are invalid, context specific help text is displayed
  // that helps the user remedy the problem.
  email: Vat.string(),
  redirectTo: Vat.url(),
  uid: Vat.string(),
});

/*eslint-enable camelcase*/

var Relier = BaseRelier.extend({
  defaults: {
    // This ensures for non-oauth reliers, SOME context is sent to the auth
    // server to let the auth server know requests come from the content
    // server and not some other service.
    context: Constants.CONTENT_SERVER_CONTEXT,
    email: null,
    entrypoint: null,
    entrypointExperiment: null,
    entrypointVariation: null,
    resetPasswordConfirm: true,
    setting: null,
    service: null,
    serviceName: t(Constants.RELIER_DEFAULT_SERVICE_NAME),
    subscriptionProductId: null,
    subscriptionProductName: null,
    style: null,
    uid: null,
    utmCampaign: null,
    utmContent: null,
    utmMedium: null,
    utmSource: null,
    utmTerm: null,
  },

  initialize(attributes, options = {}) {
    this._config = options.config;
    this.isVerification = options.isVerification;
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
   * fetch () {
   *   return Relier.prototype.fetch.call(this)
   *       .then(function () {
   *         // do overriding behavior here.
   *       });
   * }
   *
   * @method fetch
   * @returns {Promise}
   */
  fetch() {
    return Promise.resolve().then(() => {
      // parse the resume token before importing any other data.
      // query parameters and server provided data override
      // resume provided data.
      this.populateFromStringifiedResumeToken(this.getSearchParam('resume'));
      // TODO - validate data coming from the resume token

      if (this.isVerification) {
        this.importSearchParamsUsingSchema(
          VERIFICATION_QUERY_PARAMETER_SCHEMA,
          AuthErrors
        );
      } else {
        // Import using QUERY_PARAMETER_SCHEMA to get `action`, then decide how
        // to handle the email.
        this.importSearchParamsUsingSchema(QUERY_PARAMETER_SCHEMA, AuthErrors);
        if (this.get('action') === 'email') {
          this.importSearchParamsUsingSchema(
            EMAIL_FIRST_EMAIL_SCHEMA,
            AuthErrors
          );
        } else {
          this.importSearchParamsUsingSchema(
            SIGNIN_SIGNUP_EMAIL_SCHEMA,
            AuthErrors
          );
        }
      }

      // FxDesktop declares both `entryPoint` (capital P) and
      // `entrypoint` (lowcase p). Normalize to `entrypoint`.
      if (this.has('entryPoint') && !this.has('entrypoint')) {
        this.set('entrypoint', this.get('entryPoint'));
      }

      // HACK: issue #6121 - we want to fetch the subscription product
      // name as the "service" here if we're starting from a payment flow.
      // But, this fetch() is called long before router or any view logic
      // kicks in. So, let's check the URL path here to see if there's a
      // product ID for name lookup.
      const subscriptionProductRouteMatch = SUBSCRIPTION_PRODUCT_ROUTE_RE.exec(
        window.location.pathname
      );
      if (subscriptionProductRouteMatch) {
        const productId = subscriptionProductRouteMatch[1];
        this.set('subscriptionProductId', productId);
        return this.fetchSubscriptionProductName();
      }
    });
  },

  fetchSubscriptionProductName() {
    const subscriptionProductId = this.get('subscriptionProductId');
    if (!subscriptionProductId) {
      return;
    }
    const subscriptionProductName = this.get('subscriptionProductName');
    if (subscriptionProductName) {
      return;
    }
    const productNameUrl = `${this._config.authServerUrl}/v1/oauth/subscriptions/productname?productId=${subscriptionProductId}`;
    return xhr.ajax({ type: 'GET', url: productNameUrl }).then((data) => {
      if (data && data.product_name) {
        this.set('subscriptionProductName', data.product_name);
      } else {
        this.clear('subscriptionProductId');
      }
    });
  },

  resumeTokenFields: RELIER_FIELDS_IN_RESUME_TOKEN,
});

Cocktail.mixin(Relier, ResumeTokenMixin, UrlMixin);

export default Relier;
