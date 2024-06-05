/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AccountResetMixin from './mixins/account-reset-mixin';
import { assign } from 'underscore';
import AuthErrors from '../lib/auth-errors';
import CachedCredentialsMixin from './mixins/cached-credentials-mixin';
import Cocktail from 'cocktail';
import FlowEventsMixin from './mixins/flow-events-mixin';
import FormPrefillMixin from './mixins/form-prefill-mixin';
import FormView from './form';
import GleanMetrics from '../lib/glean';
import Nimbus from '../lib/nimbus';
import PasswordMixin from './mixins/password-mixin';
import preventDefaultThen from './decorators/prevent_default_then';
import ServiceMixin from './mixins/service-mixin';
import SignedInNotificationMixin from './mixins/signed-in-notification-mixin';
import SignInMixin from './mixins/signin-mixin';
import Template from 'templates/sign_in_password.mustache';
import ThirdPartyAuthMixin from './mixins/third-party-auth-mixin';
import ThirdPartyAuth from '../templates/partial/third-party-auth.mustache';
import UserCardMixin from './mixins/user-card-mixin';
import PocketMigrationMixin from './mixins/pocket-migration-mixin';
import BrandMessagingMixin from './mixins/brand-messaging-mixin';
import MonitorClientMixin from './mixins/monitor-client-mixin';

const SignInPasswordView = FormView.extend({
  template: Template,

  events: assign({}, FormView.prototype.events, {
    'click #use-different': preventDefaultThen('useDifferentAccount'),
  }),

  useDifferentAccount() {
    // a user who came from an OAuth relier and was
    // directed directly to /signin will not be able
    // to go back. Send them directly to `/` with the
    // account. The email will be prefilled on that page.
    this.clearInput();
    this.navigate('/', { account: this.getAccount() });
  },

  getAccount() {
    return this.model.get('account');
  },

  beforeRender() {
    const account = this.getAccount();
    if (!account || !account.get('email')) {
      this.navigate('/');
    }

    // If a previously authenticated account was found locally and it had opted
    // out of data collection
    if (account && account.get('metricsEnabled') === false) {
      GleanMetrics.setEnabled(false);
    }

    // We need an explicit call here in case a user directly navigates to
    // /signin or they're redirected, e.g. when directly accessing settings.
    // However, we don't want to call this if the previous enter email screen
    // already called this, verified the account exists, and set the third party
    // auth data because of rate limiting on the POST account/status endpoint.
    // We can't use account/status GET since we don't always have the uid.
    if (
      account &&
      (account.get('hasLinkedAccount') === undefined ||
        account.get('hasPassword') === undefined)
    ) {
      return account.checkAccountStatus().catch(() => {
        // Unlikely, but if this errors, it's probably due to rate limiting,
        // see note above. Regardless, don't block the user from proceeding
        // because this check failed, and assume they have a password set
        // (since most users do) via defaults set in setInitialContext.
        // See https://github.com/mozilla/fxa/pull/15456#discussion_r1237799514
      });
    }
  },

  logView() {
    const context = this.getContext();

    if (!context.isPasswordNeeded) {
      GleanMetrics.cachedLogin.view();
    } else {
      GleanMetrics.login.view();
    }

    return FormView.prototype.logView.call(this);
  },

  setInitialContext(context) {
    const account = this.getAccount();
    const hasLinkedAccount = account.get('hasLinkedAccount') ?? false;
    const hasPassword = account.get('hasPassword') ?? true;
    const hasLinkedAccountAndNoPassword = hasLinkedAccount && !hasPassword;
    context.set({
      email: account.get('email'),
      nimbusExperiments: Nimbus.experiments,
      isPasswordNeeded: this.isPasswordNeededForAccount(account) && hasPassword,
      hasLinkedAccountAndNoPassword: hasLinkedAccount && !hasPassword,
      hasLinkedAccount: hasLinkedAccount,
      hasPassword: hasPassword,
      unsafeThirdPartyAuthHTML: this.renderTemplate(ThirdPartyAuth, {
        showSeparator: !hasLinkedAccountAndNoPassword,
      }),
    });
  },

  submit() {
    const account = this.getAccount();
    if (this.isPasswordNeededForAccount(account)) {
      const password = this.getElementValue('input[type=password]');
      GleanMetrics.login.submit();
      return this.signIn(account, password).catch((error) =>
        this.onSignInError(account, password, error)
      );
    } else {
      GleanMetrics.cachedLogin.submit();
      return this.useLoggedInAccount(account);
    }
  },

  onSignInError(account, password, err) {
    if (AuthErrors.is(err, 'USER_CANCELED_LOGIN')) {
      this.logViewEvent('canceled');
      // if user canceled login, just stop
      return;
    }

    if (AuthErrors.is(err, 'ACCOUNT_RESET')) {
      GleanMetrics.login.error({ reason: 'account locked' });
      return this.notifyOfResetAccount(account);
    } else if (AuthErrors.is(err, 'INCORRECT_PASSWORD')) {
      GleanMetrics.login.error({ reason: 'password incorrect' });
      return this.showValidationError(this.$('input[type=password]'), err);
    } else if (AuthErrors.is(err, 'UNABLE_TO_LOGIN_NO_PASSWORD_SET')) {
      GleanMetrics.login.error({ reason: 'password missing' });
      return this.unsafeDisplayError(err);
    }

    // re-throw error, it will be handled at a lower level.
    throw err;
  },
});

Cocktail.mixin(
  SignInPasswordView,
  AccountResetMixin,
  CachedCredentialsMixin,
  FlowEventsMixin,
  FormPrefillMixin,
  PasswordMixin,
  ServiceMixin,
  SignInMixin,
  SignedInNotificationMixin,
  ThirdPartyAuthMixin,
  UserCardMixin,
  PocketMigrationMixin,
  BrandMessagingMixin,
  MonitorClientMixin
);

export default SignInPasswordView;
