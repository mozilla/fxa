/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import BackMixin from './mixins/back-mixin';
import Cocktail from 'cocktail';
import FlowEventsMixin from './mixins/flow-events-mixin';
import FormPrefillMixin from './mixins/form-prefill-mixin';
import FormView from './form';
import PasswordMixin from './mixins/password-mixin';
import ServiceMixin from './mixins/service-mixin';
import SignInMixin from './mixins/signin-mixin';
import Template from 'templates/sign_in_password.mustache';
import UserCardMixin from './mixins/user-card-mixin';

class SignInPasswordView extends FormView {
  constructor (options) {
    super(options);

    this.template = Template;
  }

  getAccount () {
    return this.model.get('account');
  }

  beforeRender () {
    if (! this.getAccount()) {
      this.navigate('/');
    }
  }

  setInitialContext (context) {
    context.set(this.getAccount().pick('email'));
  }

  submit () {
    const password = this.getElementValue('input[type=password]');

    return this.signIn(this.getAccount(), password);
  }
}

Cocktail.mixin(
  SignInPasswordView,
  BackMixin,
  FlowEventsMixin,
  FormPrefillMixin,
  PasswordMixin,
  ServiceMixin,
  SignInMixin,
  UserCardMixin,
);

module.exports = SignInPasswordView;
