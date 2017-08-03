/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redirect users that browse to `/` to `signup` or `settings`
 * depending on whether the user is authenticated.
 *
 * @module views/index
 */
define(function (require, exports, module) {
  'use strict';

  const Cocktail = require('cocktail');
  const CoppaMixin = require('views/mixins/coppa-mixin');
  const FlowBeginMixin = require('views/mixins/flow-begin-mixin');
  const FormPrefillMixin = require('views/mixins/form-prefill-mixin');
  const FormView = require('views/form');
  const SearchParamMixin = require('lib/search-param-mixin');
  const ServiceMixin = require('views/mixins/service-mixin');
  const Template = require('stache!templates/index');

  class IndexView extends FormView {
    constructor (options) {
      super(options);

      this.template = Template;
    }

    afterRender () {
      // COPPA checks whether the user is too young in beforeRender.
      // So that COPPA takes precedece, do all other checks afterwards.
      const action = this.relier.get('action') || 'signup';
      if (this.user.getSignedInAccount().get('sessionToken')) {
        this.replaceCurrentPage('settings');
      } else if (action !== 'email') {
        this.replaceCurrentPage(action);
      } else {
        // notifies the router that the user is in the email-first flow.
        this.notifier.trigger('email-first-flow');
      }
    }

    submit () {
      const email = this.getElementValue('input[type=email]');

      return this.checkEmail(email);
    }

    /**
     * Check `email`. If registered, send the user to `signin`,
     * if not registered, `signup`
     *
     * @param {String} email
     * @returns {Promise}
     */
    checkEmail (email) {
      const account = this.user.initAccount({
        email
      });

      // before checking whether the email exists, check
      // that accounts can be merged.
      return this.invokeBrokerMethod('beforeSignIn', account)
        .then(() => this.user.checkAccountEmailExists(account))
        .then((exists) => {
          const nextEndpoint = exists ? 'signin' : 'signup';
          this.navigate(nextEndpoint, { account });
        });
    }
  }

  Cocktail.mixin(
    IndexView,
    CoppaMixin({}),
    FlowBeginMixin,
    FormPrefillMixin,
    SearchParamMixin,
    ServiceMixin
  );

  module.exports = IndexView;
});
