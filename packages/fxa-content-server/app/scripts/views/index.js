/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redirect users that browse to `/` to `signup` or `settings`
 * depending on whether the user is authenticated.
 *
 * @module views/index
 */
import CachedCredentialsMixin from './mixins/cached-credentials-mixin';
import Cocktail from 'cocktail';
import CoppaMixin from './mixins/coppa-mixin';
import EmailFirstExperimentMixin from './mixins/email-first-experiment-mixin';
import TokenCodeExperimentMixin from './mixins/token-code-experiment-mixin';
import FlowBeginMixin from './mixins/flow-begin-mixin';
import FormPrefillMixin from './mixins/form-prefill-mixin';
import FormView from './form';
import ServiceMixin from './mixins/service-mixin';
import Template from 'templates/index.mustache';

class IndexView extends FormView {
  template = Template;

  get viewName () {
    return 'enter-email';
  }

  getAccount () {
    return this.model.get('account');
  }

  beforeRender () {
    const account = this.getAccount();
    if (account) {
      this.formPrefill.set(account.pick('email'));
    }
  }

  afterRender () {
    // 1. COPPA checks whether the user is too young in beforeRender.
    // So that COPPA takes precedence, do all other checks afterwards.
    // 2. action=email is specified by the firstrun page to specify
    // the email-first flow.
    const action = this.relier.get('action');
    if (action && action !== 'email') {
      this.replaceCurrentPage(action);
    } else if (this.isInEmailFirstExperimentGroup('treatment') || action === 'email') {
      return this.chooseEmailActionPage();
    } else if (this.getSignedInAccount().get('sessionToken')) {
      this.replaceCurrentPage('settings');
    } else {
      this.replaceCurrentPage('signup');
    }
  }

  chooseEmailActionPage () {
    const relierEmail = this.relier.get('email');
    const accountFromPreviousScreen = this.getAccount();
    const suggestedAccount = this.suggestedAccount();
    // let's the router know to use the email-first signin/signup page
    this.notifier.trigger('email-first-flow');

    if (accountFromPreviousScreen) {
      // intentionally empty
      // shows the email-first template, the prefill email was set in beforeRender
    } else if (relierEmail) {
      return this.checkEmail(relierEmail);
    } else if (this.allowSuggestedAccount(suggestedAccount)) {
      this.replaceCurrentPage('signin', {
        account: suggestedAccount
      });
    }
    // else, show the email-first template.
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
        const nextEndpoint = exists ? 'signin' : 'signup';
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
  CachedCredentialsMixin,
  CoppaMixin({}),
  EmailFirstExperimentMixin(),
  TokenCodeExperimentMixin,
  FlowBeginMixin,
  FormPrefillMixin,
  ServiceMixin
);

module.exports = IndexView;
