/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Shared implementation of `signUp` view method

import ResumeTokenMixin from './resume-token-mixin';

export default {
  dependsOn: [ResumeTokenMixin],

  /*anchor tag present in both signin and signup views*/
  events: {
    'click #suggest-sync a': 'onSuggestSyncClick',
  },

  /**
   * Sign up a user
   *
   * @param {Object} account
   * @param {String} password
   * @return {Object} promise
   */
  signUp(account, password) {
    return this.invokeBrokerMethod('beforeSignIn', account)
      .then(() => {
        // Always pass `signup` for viewName regardless of the actual view
        // because we want to log the real action that is being performed.
        // This is important for the infamous signin-from-signup feature.
        this.logFlowEvent('attempt', 'signup');

        return this.user.signUpAccount(account, password, this.relier, {
          resume: this.getStringifiedResumeToken(account),
        });
      })
      .then(account => {
        if (this.formPrefill) {
          this.formPrefill.clear();
        }
        // A message is triggered on account creation for experiments
        // can track whether their UI affects account creation rate.
        this.notifier.trigger('account.created');

        var onSubmitComplete = this.onSignUpSuccess.bind(this);

        if (this.relier.accountNeedsPermissions(account)) {
          return this.navigate('signup_permissions', {
            account: account,
            // the permissions screen will call onSubmitComplete
            // with an updated account
            onSubmitComplete: onSubmitComplete,
          });
        } else if (this.broker.get('chooseWhatToSyncWebV1Engines')) {
          return this.navigate('choose_what_to_sync', {
            account: account,
            // choose_what_to_sync screen will call onSubmitComplete
            // with an updated account
            onSubmitComplete: onSubmitComplete,
          });
        }

        return this.onSignUpSuccess(account);
      });
  },

  onSignUpSuccess(account) {
    this.logViewEvent('success');
    this.logViewEvent('signup.success');

    // do NOT propagate the returned promise. The broker
    // delegates to a NavigateBehavior which returns a promise
    // that never resolves. The next screen ends up invoking
    // this function in their submit handler, which causes
    // a "Working" error to be logged. See #5655
    this.invokeBrokerMethod('afterSignUp', account);
  },

  onSuggestSyncClick() {
    this.logViewEvent('sync-suggest.clicked');
  },
};
