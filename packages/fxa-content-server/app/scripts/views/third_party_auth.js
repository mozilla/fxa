/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This is a special purpose and barebone version of our
 * index page. This page is used specifically for showing
 * third party auth options. This page loads third party
 * javascript.
 *
 * @module views/third_party_auth
 */
import Cocktail from 'cocktail';
import ExperimentMixin from './mixins/experiment-mixin';
import ThirdPartyAuth from '../templates/partial/third-party-auth.mustache';
import FlowBeginMixin from './mixins/flow-begin-mixin';
import FormPrefillMixin from './mixins/form-prefill-mixin';
import FormView from './form';
import ServiceMixin from './mixins/service-mixin';
import SignedInNotificationMixin from './mixins/signed-in-notification-mixin';
import GoogleAuthMixin from './mixins/google-auth-mixin';
import Template from 'templates/index.mustache';
import PocketMigrationMixin from './mixins/pocket-migration-mixin';

const EMAIL_SELECTOR = 'input[type=email]';

class ThirdPartyAuthIndexView extends FormView {
  template = Template;

  partialTemplates = {
    unsafeThirdPartyAuthHTML: ThirdPartyAuth,
  };

  constructor(options) {
    super(options);
    this.config = options.config || {};
  }

  get viewName() {
    return 'enter-email-third-party';
  }

  getAccount() {
    return this.model.get('account');
  }

  beforeRender() {
    const account = this.getAccount();
    const relierEmail = this.relier.get('email');
    if (account) {
      this.formPrefill.set(account.pick('email'));
    } else if (relierEmail) {
      this.formPrefill.set('email', relierEmail);
    }
  }

  submit() {
    return this.navigateAwayThirdPartyAuth('', this._getEmail());
  }

  _getEmail() {
    return this.getElementValue(EMAIL_SELECTOR);
  }
}

Cocktail.mixin(
  ThirdPartyAuthIndexView,
  ExperimentMixin,
  FlowBeginMixin,
  FormPrefillMixin,
  ServiceMixin,
  SignedInNotificationMixin,
  GoogleAuthMixin,
  PocketMigrationMixin
);

export default ThirdPartyAuthIndexView;
