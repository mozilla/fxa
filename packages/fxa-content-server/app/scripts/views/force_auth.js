/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import AuthErrors from '../lib/auth-errors';
import cancelEventThen from './decorators/cancel_event_then';
import Cocktail from 'cocktail';
import NullBehavior from './behaviors/null';
import PasswordResetMixin from './mixins/password-reset-mixin';
import SignInView from './sign_in';
import ServiceMixin from './mixins/service-mixin';
import Template from 'templates/force_auth.mustache';
import Transform from '../lib/transform';
import UserCardMixin from './mixins/user-card-mixin';
import Vat from '../lib/vat';

const t = msg => msg;

var RELIER_DATA_SCHEMA = {
  email: Vat.email().required(),
  uid: Vat.uid().allow(null),
};

var proto = SignInView.prototype;

var View = SignInView.extend({
  template: Template,
  className: 'force-auth',

  // used by the signin-mixin to decide which broker method to
  // call with which data when signin is successful.
  afterSignInBrokerMethod: 'afterForceAuth',
  afterSignInNavigateData: { clearQueryParams: true },

  _getAndValidateAccountData() {
    var fieldsToPick = ['email', 'uid'];
    var accountData = {};
    var relier = this.relier;

    fieldsToPick.forEach(function(fieldName) {
      if (relier.has(fieldName)) {
        accountData[fieldName] = relier.get(fieldName);
      }
    });

    return Transform.transformUsingSchema(
      accountData,
      RELIER_DATA_SCHEMA,
      AuthErrors
    );
  },

  beforeRender() {
    var accountData;

    try {
      accountData = this._getAndValidateAccountData();
    } catch (err) {
      // uid query parameter validation errors are not handled here,
      // rather they are handled on startup by the relier.
      this.fatalError(err);
      return false;
    }

    /**
     * If the relier specifies a UID, check whether the UID is still
     * registered. If the uid is not registered, the account
     * was probably deleted. If the broker supports UID changes,
     * the user will still be allowed to signup or in, depending on
     * whether the email is registered. If not, show a useful error
     * and do not allow the user to continue.
     */
    var account = this.user.initAccount({
      email: accountData.email,
      uid: accountData.uid,
    });

    if (accountData.uid) {
      return Promise.all([
        this.user.checkAccountEmailExists(account),
        this.user.checkAccountUidExists(account),
      ]).then(([emailExists, uidExists]) => {
        /*
         * uidExists: false, emailExists: false
         *   Let user sign up w/ email.
         * uidExists: true, emailExists: false
         *   Uid exists but doesn't match email, how'd this happen?
         *   Let the user sign up.
         * uidExists: false, emailExists: true
         *   Sign in w/ new uid.
         * uidExists: true, emailExists: true
         *   Assume for the same account, try to sign in
         */
        if (! emailExists) {
          return this._signUpIfUidChangeSupported(account);
        }
        if (! uidExists) {
          return this._signInIfUidChangeSupported(account);
        }

        // email and uid are both registered, continue as normal
      });
    } else {
      // relier did not specify a uid, there's a bit more flexibility.
      // If the email no longer exists, sign up the user.
      return this.user.checkAccountEmailExists(account).then(emailExists => {
        if (! emailExists) {
          return this._navigateToForceSignUp(account);
        }
      });
    }
  },

  _signUpIfUidChangeSupported(account) {
    if (this.broker.hasCapability('allowUidChange')) {
      return this._navigateToForceSignUp(account);
    } else {
      this.model.set('error', AuthErrors.toError('DELETED_ACCOUNT'));
    }
  },

  _signInIfUidChangeSupported(account) {
    // if the broker supports a UID change, use force_auth to sign in,
    // otherwise print a big error message.
    if (! this.broker.hasCapability('allowUidChange')) {
      this.model.set('error', AuthErrors.toError('DELETED_ACCOUNT'));
    }
  },

  _navigateToForceSignUp(account) {
    // The default behavior of FxDesktop brokers is to halt before
    // the signup confirmation poll because about:accounts takes care
    // of polling and updating the UI. /force_auth is not opened in
    // about:accounts and unless beforeSignUpConfirmationPoll is
    // overridden, the user receives no visual feedback in this
    // tab once the verification is complete.
    this.broker.setBehavior('beforeSignUpConfirmationPoll', new NullBehavior());

    return this.navigate('signup', {
      error: AuthErrors.toError('DELETED_ACCOUNT'),
      // account is for the email-first signup flow, without an account
      // the signup page redirects to index
      account,
      // forceEmail is a hint to the signup page that the user should not
      // be given the option to change their address.
      forceEmail: account.get('email'),
    });
  },

  _navigateToForceResetPassword() {
    return this.navigate('reset_password', {
      forceEmail: this.relier.get('email'),
    });
  },

  setInitialContext(context) {
    /// submit button
    const buttonSignInText = this.translate(t('Sign in'), {
      msgctxt: 'submit button',
    });

    context.set({
      buttonSignInText,
      email: this.relier.get('email'),
    });
  },

  events: _.extend({}, SignInView.prototype.events, {
    'click a[href="/reset_password"]': cancelEventThen(
      '_navigateToForceResetPassword'
    ),
  }),

  onSignInError(account, password, error) {
    if (AuthErrors.is(error, 'UNKNOWN_ACCOUNT')) {
      if (this.relier.has('uid')) {
        if (this.broker.hasCapability('allowUidChange')) {
          return this._navigateToForceSignUp(account);
        } else {
          this.displayError(AuthErrors.toError('DELETED_ACCOUNT'));
        }
      } else {
        return this._navigateToForceSignUp(account);
      }
    }

    return proto.onSignInError.call(this, account, password, error);
  },

  getAccount() {
    const email = this.relier.get('email');
    const account = this.user.getAccountByEmail(email);

    // if no account is in localStorage for the email address,
    // the returned account will be the default. Set the email
    // so that the user-card displays correctly.
    if (account.isDefault()) {
      account.set({
        email,
        uid: this.relier.get('uid'),
      });
    }

    return account;
  },
});

Cocktail.mixin(View, PasswordResetMixin, ServiceMixin, UserCardMixin);

export default View;
