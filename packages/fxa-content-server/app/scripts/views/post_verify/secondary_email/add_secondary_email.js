/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Post verify view that start the process of creating a secondary email via a code.
 */
import { _, assign } from 'underscore';
import Cocktail from 'cocktail';
import FormView from '../../form';
import ServiceMixin from '../..//mixins/service-mixin';
import Template from 'templates/post_verify/secondary_email/add_secondary_email.mustache';
import VerificationMethods from '../../../lib/verification-methods';
import preventDefaultThen from '../../decorators/prevent_default_then';

const EMAIL_INPUT_SELECTOR = 'input.new-email';

class AddSecondaryEmail extends FormView {
  template = Template;
  viewName = 'add-secondary-email';

  events = assign(this.events, {
    'click #maybe-later-btn': preventDefaultThen('_clickMaybeLater'),
  });

  beforeRender() {
    const account = this.getSignedInAccount();
    if (account.isDefault()) {
      return this.replaceCurrentPage('/');
    }
  }

  setInitialContext(context) {
    const account = this.getSignedInAccount();
    const email = account.get('email');
    context.set({
      email,
      escapedEmail: `<span class="email">${_.escape(email)}</span>`,
    });
  }

  submit() {
    const account = this.getSignedInAccount();
    const newEmail = this.getElementValue(EMAIL_INPUT_SELECTOR);
    return account
      .recoveryEmailCreate(newEmail, {
        // The EMAIL_OTP method will send the user a code to verify the secondary email
        verificationMethod: VerificationMethods.EMAIL_OTP,
      })
      .then(() => {
        return this.navigate(
          '/post_verify/secondary_email/confirm_secondary_email',
          {
            secondaryEmail: newEmail,
          }
        );
      })
      .catch(err =>
        this.showValidationError(this.$(EMAIL_INPUT_SELECTOR), err)
      );
  }

  _clickMaybeLater() {
    const account = this.getSignedInAccount();
    account.unset('verificationReason');
    return this.invokeBrokerMethod('afterCompleteSignUp', account);
  }
}

Cocktail.mixin(AddSecondaryEmail, ServiceMixin);

export default AddSecondaryEmail;
