/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Post verify view that start the process of creating a secondary email via a code.
 */
import _ from 'underscore';
import Cocktail from 'cocktail';
import FormView from '../../form';
import FlowEventsMixin from './../../mixins/flow-events-mixin';
import ServiceMixin from '../..//mixins/service-mixin';
import Template from 'templates/post_verify/secondary_email/add_secondary_email.mustache';
import VerificationMethods from '../../../lib/verification-methods';

const EMAIL_INPUT_SELECTOR = 'input.new-email';

class AddSecondaryEmail extends FormView {
  template = Template;
  viewName = 'add-secondary-email';

  beforeRender() {
    const account = this.getSignedInAccount();
    if (account.isDefault()) {
      this.relier.set('redirectTo', this.window.location.href);
      return this.replaceCurrentPage('/');
    }

    // An account can support multiple emails, however this flow is specific
    // to adding the first secondary email. In these cases navigate to user's
    // settings page.
    return account.recoveryEmails().then(emails => {
      if (emails && emails.length > 1) {
        return this.navigate('/settings');
      }
    });
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
}

Cocktail.mixin(AddSecondaryEmail, FlowEventsMixin, ServiceMixin);

export default AddSecondaryEmail;
