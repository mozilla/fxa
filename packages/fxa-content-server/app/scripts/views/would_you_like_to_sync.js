/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import BackMixin from './mixins/back-mixin';
import Cocktail from 'cocktail';
import DoNotSyncMixin from './mixins/do-not-sync-mixin';
import FlowEventsMixin from './mixins/flow-events-mixin';
import FormView from './form';
import Template from 'templates/would-you-like-to-sync.mustache';

const SCREEN_CLASS = 'screen-would-you-like-to-sync';

const View = FormView.extend(
  {
    template: Template,
    className: 'would-you-like-to-sync',

    initialize(options = {}) {
      // Account data is passed in from sign up flow.
      this._account = this.user.initAccount(this.model.get('account'));

      // to keep the view from knowing too much about the state machine,
      // a continuation function is passed in that should be called
      // when submit has completed.
      this.skipCWTS = this.model.get('skipCWTS');
      this.onSubmitComplete = this.model.get('onSubmitComplete');
    },

    getAccount() {
      return this._account;
    },

    beforeRender() {
      // user cannot proceed if they have not initiated a sign up/in.
      if (! this.getAccount().get('sessionToken')) {
        this.navigate('signup');
      }
    },

    submit() {
      return Promise.resolve().then(() => {
        const account = this.getAccount();
        if (this.skipCWTS) {
          // don't ask to specify data choices via CWTS
          // see https://github.com/mozilla/fxa/issues/3083 for details
          return this.onSubmitComplete(account);
        }

        // we replace the current view to avoid various problems with the back button
        return this.replaceCurrentPage('choose_what_to_sync', {
          account: account,
          // choose_what_to_sync screen will call onSubmitComplete
          // with an updated account
          onSubmitComplete: this.onSubmitComplete,
          allowToDisableSync: false,
        });
      });
    },
  },
  {
    SCREEN_CLASS,
  }
);

Cocktail.mixin(View, BackMixin, FlowEventsMixin, DoNotSyncMixin);

export default View;
