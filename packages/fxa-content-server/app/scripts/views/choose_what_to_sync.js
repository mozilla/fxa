/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import _ from 'underscore';
import $ from 'jquery';
import BackMixin from './mixins/back-mixin';
import Cocktail from 'cocktail';
import DoNotSyncMixin from './mixins/do-not-sync-mixin';
import FlowEventsMixin from './mixins/flow-events-mixin';
import FormView from './form';
import SessionVerificationPollMixin from './mixins/session-verification-poll-mixin';
import Template from 'templates/choose_what_to_sync.mustache';

const SCREEN_CLASS = 'screen-choose-what-to-sync';

const proto = FormView.prototype;
const View = FormView.extend(
  {
    template: Template,
    className: 'choose-what-to-sync',

    initialize() {
      // Account data is passed in from sign up flow.
      this._account = this.user.initAccount(this.model.get('account'));

      // to keep the view from knowing too much about the state machine,
      // a continuation function is passed in that should be called
      // when submit has completed.
      this.onSubmitComplete = this.model.get('onSubmitComplete');

      // we only want to show the do not sync button for multi-service browser,
      // that are not logging into sync and that came from a sign up flow.
      this.allowToDisableSync = this.model.get('allowToDisableSync');
      // in some cases where the user has a choice to decline Sync
      // we don't want to poll for verification
      this.pollVerification = this.model.get('pollVerification');
    },

    getAccount() {
      return this._account;
    },

    beforeRender() {
      // user cannot proceed if they have not initiated a sign up/in.
      if (!this.getAccount().get('sessionToken')) {
        this.navigate('signup');
      }
    },

    afterRender() {
      // the 'choose-what-to-sync' view is a special case view
      // where we want to hide the logo and not animate it
      // it uses `!important` to avoid the fade-in effect and inline styles.
      $('body').addClass(SCREEN_CLASS);
    },

    afterVisible() {
      const account = this.getAccount();
      return (
        proto.afterVisible
          .call(this)
          // The verification data needs to be written to localStorage
          // in case the user verifies while at CWTS. The data is used
          // by CAD to determine that the user is verifying in the same
          // browser, and to avoid asking the user to sign in again.
          // See #5554
          .then(() => this.broker.persistVerificationData(account))
          .then(() => {
            if (this.pollVerification) {
              // we should only wait for session verification here
              // if the user doesn't have an option to disable sync
              this.waitForSessionVerification(account, () =>
                this.validateAndSubmit()
              );
            }
          })
      );
    },

    destroy(...args) {
      $('body').removeClass(SCREEN_CLASS);
      return proto.destroy.call(this, ...args);
    },

    setInitialContext(context) {
      const account = this.getAccount();
      const engines = this._getOfferedEngines();

      context.set({
        email: account.get('email'),
        engines,
        showDoNotSyncButton: this.allowToDisableSync,
      });
    },

    submit() {
      return Promise.resolve().then(() => {
        const account = this.getAccount();
        const declinedSyncEngines = this._getDeclinedEngineIds();
        const offeredSyncEngines = this._getOfferedEngineIds();

        this._trackDeclinedEngineIds(declinedSyncEngines);

        account.set({
          declinedSyncEngines,
          offeredSyncEngines,
        });

        this.notifier.trigger(
          'set-sync-engines',
          offeredSyncEngines.filter(e => declinedSyncEngines.indexOf(e) === -1)
        );
        return this.onSubmitComplete(account);
      });
    },

    /**
     * Get a list of displayed Sync engine configs that can be used
     * for display.
     *
     * @returns {Object[]}
     */
    _getOfferedEngines() {
      return this.broker
        .get('chooseWhatToSyncWebV1Engines')
        .toJSON()
        .map((syncEngine, index) => {
          const engineWithTabIndex = Object.create(syncEngine);
          engineWithTabIndex.tabindex = (index + 1) * 5;
          engineWithTabIndex.text = this.translate(engineWithTabIndex.text, {});
          return engineWithTabIndex;
        });
    },

    /**
     * Get a list of engineIds that are displayed to the user.
     *
     * @returns {String[]}
     */
    _getOfferedEngineIds() {
      return this._getOfferedEngines().map(syncEngine => syncEngine.id);
    },

    /**
     * Get sync engines that were declined.
     *
     * @returns {String[]}
     * @private
     */
    _getDeclinedEngineIds() {
      var uncheckedEngineEls = this.$el
        .find('input[name=sync-content]')
        .not(':checked');

      return uncheckedEngineEls
        .map(function() {
          return this.value;
        })
        .get();
    },

    /**
     * Keep track of what sync engines the user declines
     *
     * @param {String[]} declinedEngineIds
     * @private
     */
    _trackDeclinedEngineIds(declinedEngineIds) {
      if (_.isArray(declinedEngineIds)) {
        declinedEngineIds.forEach(engineId => {
          this.logViewEvent(`engine-unchecked.${engineId}`);
        });
      }
    },
  },
  {
    SCREEN_CLASS,
  }
);

Cocktail.mixin(
  View,
  BackMixin,
  FlowEventsMixin,
  SessionVerificationPollMixin,
  DoNotSyncMixin
);

export default View;
