/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This view handles adding newsletters subscriptions to a user's account.
 * Currently, users can only subscribe to newsletters. To unsubscribe for a
 * newsletter, they must goto their email preferences.
 */
import { assign } from 'underscore';
import Cocktail from 'cocktail';
import EmailOptInMixin from '../../mixins/email-opt-in-mixin';
import FormView from '../../form';
import Template from 'templates/post_verify/newsletters/add_newsletters.mustache';
import preventDefaultThen from '../../decorators/prevent_default_then';

class AddNewsletters extends FormView {
  template = Template;
  viewName = 'add-newsletter';

  events = assign(this.events, {
    'click #maybe-later-btn': preventDefaultThen('clickMaybeLater'),
  });

  beforeRender() {
    const account = this.getSignedInAccount();

    // If no user is logged in redirect to the login page and set the `redirectTo` property
    // to current url. After a user has logged in, they will be redirected back to this page.
    if (account.isDefault()) {
      this.relier.set('redirectTo', this.window.location.href);
      return this.replaceCurrentPage('/');
    }
  }

  submit() {
    const optedInNewsletters = this.getOptedIntoNewsletters();
    const account = this.getSignedInAccount();

    return Promise.resolve()
      .then(() => {
        if (optedInNewsletters.length > 0) {
          return account.updateNewsletters(optedInNewsletters);
        }
      })
      .then(() => {
        return this.invokeBrokerMethod('afterSignUpConfirmationPoll', account);
      });
  }

  clickMaybeLater() {
    const account = this.getSignedInAccount();
    return this.invokeBrokerMethod('afterSignUpConfirmationPoll', account);
  }
}

Cocktail.mixin(AddNewsletters, EmailOptInMixin);

export default AddNewsletters;
