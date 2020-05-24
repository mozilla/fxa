/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Notifies the user that their sign-in confirmation email bounced.
 */
import BackMixin from './mixins/back-mixin';
import BaseView from './base';
import Cocktail from 'cocktail';
import FlowEventsMixin from './mixins/flow-events-mixin';
import preventDefaultThen from './decorators/prevent_default_then';
import Session from '../lib/session';
import Template from 'templates/sign_in_bounced.mustache';

const SignInBouncedView = BaseView.extend({
  events: {
    'click #create-account': '_createAccount',
  },

  template: Template,

  initialize(options) {
    this._formPrefill = options.formPrefill;
  },

  beforeRender() {
    if (!this.model.has('email')) {
      // This may occur if the user has refreshed the page. In that case,
      // we have no context for properly rendering the view, so kick them
      // out to /signin where they can start again.
      this.navigate('signin');
    }
  },

  setInitialContext(context) {
    context.set({
      email: this.model.get('email'),
      escapedSupportLinkAttrs:
        'id="support" href="https://support.mozilla.org/" target="_blank" data-flow-event="link.support"',
    });
  },

  _createAccount: preventDefaultThen(function () {
    this.user.removeAllAccounts();
    Session.clear();
    this._formPrefill.clear();
    this.navigate('signup');
  }),
});

Cocktail.mixin(SignInBouncedView, BackMixin, FlowEventsMixin);

export default SignInBouncedView;
