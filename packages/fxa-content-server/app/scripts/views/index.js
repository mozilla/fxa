/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redirect users that browse to `/` to `signup` or `settings`
 * depending on whether the user is authenticated.
 *
 * @module views/index
 */
import Cocktail from 'cocktail';
import CoppaMixin from './mixins/coppa-mixin';
import EmailFirstExperimentMixin from './mixins/email-first-experiment-mixin';
import TokenCodeExperimentMixin from './mixins/token-code-experiment-mixin';
import FlowBeginMixin from './mixins/flow-begin-mixin';
import FormPrefillMixin from './mixins/form-prefill-mixin';
import FormView from './form';
import SearchParamMixin from '../lib/search-param-mixin';
import ServiceMixin from './mixins/service-mixin';
import Template from 'templates/index.mustache';

class IndexView extends FormView {
  constructor (options) {
    super(options);

    this.template = Template;
  }

  get viewName () {
    return 'enter-email';
  }

  beforeRender () {
    const email = this.relier.get('email');
    if (email) {
      // Unsetting the relier email is to ensure the "mistyped email"
      // link on the next page works. If the user clicks "mistyped email",
      // they'd expect to come back here with the email prefilled and
      // editable. If the email was still set in the relier, we'd send
      // them right back. So, we unset the email from the relier and depend
      // on the email being saved into formPrefill for when the user comes back.
      this.relier.unset('email');
      this.formPrefill.set('email', email);
      // relierEmail is used in afterRender to decide whether to check an email.
      this.model.set('relierEmail', email);
    }
  }

  afterRender () {
    // 1. COPPA checks whether the user is too young in beforeRender.
    // So that COPPA takes precedence, do all other checks afterwards.
    // 2. action=email is specified by the firstrun page to specify
    // the email-first flow.
    const action = this.relier.get('action');
    if (this.user.getSignedInAccount().get('sessionToken')) {
      this.replaceCurrentPage('settings');
    } else if (action && action !== 'email') {
      this.replaceCurrentPage(action);
    } else if (this.isInEmailFirstExperimentGroup('treatment') || action === 'email') {
      // let's the router know to use the email-first signin/signup page
      this.notifier.trigger('email-first-flow');
      const email = this.model.get('relierEmail');
      if (email) {
        return this.checkEmail(email);
      }
    } else {
      this.replaceCurrentPage('signup');
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
    let account = this.user.initAccount({
      email
    });

      // before checking whether the email exists, check
      // that accounts can be merged.
    return this.invokeBrokerMethod('beforeSignIn', account)
      .then(() => this.user.checkAccountEmailExists(account))
      .then((exists) => {
        const nextEndpoint = this.broker.transformLink(exists ? 'signin' : 'signup');
        if (exists) {
          // If the account exists, use the stored account
          // so that any stored avatars are displayed on
          // the next page.
          account = this.user.getAccountByEmail(email);
          // the returned account could be the default,
          // ensure it's email is set.
          account.set('email', email);
        }
        this.navigate(nextEndpoint, { account });
      });
  }
}

Cocktail.mixin(
  IndexView,
  CoppaMixin({}),
  EmailFirstExperimentMixin(),
  TokenCodeExperimentMixin,
  FlowBeginMixin,
  FormPrefillMixin,
  SearchParamMixin,
  ServiceMixin
);

module.exports = IndexView;
