/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Post verify view that start the process of creating a secondary email via a code.
 */
import _ from 'underscore';
import Cocktail from 'cocktail';
import FlowEventsMixin from './../../mixins/flow-events-mixin';
import FormView from '../../form';
import ServiceMixin from '../..//mixins/service-mixin';
import Template from 'templates/post_verify/secondary_email/confirm_secondary_email.mustache';

const CODE_INPUT_SELECTOR = 'input.otp-code';

class ConfirmSecondaryEmail extends FormView {
  template = Template;
  viewName = 'confirm-secondary-email';

  beforeRender() {
    const account = this.getSignedInAccount();
    if (account.isDefault()) {
      return this.replaceCurrentPage('/');
    }
  }

  setInitialContext(context) {
    const email = context.get('secondaryEmail');
    if (!email) {
      return this.replaceCurrentPage(
        '/post_verify/secondary_email/add_secondary_email'
      );
    }

    context.set({
      email,
      escapedEmail: `<span class="email">${_.escape(email)}</span>`,
    });
  }

  submit() {
    const account = this.getSignedInAccount();
    const code = this.getElementValue(CODE_INPUT_SELECTOR);
    const email = this.model.get('secondaryEmail');
    return account
      .recoveryEmailSecondaryVerifyCode(email, code)
      .then(() => {
        return this.navigate(
          '/post_verify/secondary_email/verified_secondary_email',
          {
            secondaryEmail: email,
          }
        );
      })
      .catch(err => this.showValidationError(this.$(CODE_INPUT_SELECTOR), err));
  }
}

Cocktail.mixin(ConfirmSecondaryEmail, FlowEventsMixin, ServiceMixin);

export default ConfirmSecondaryEmail;
