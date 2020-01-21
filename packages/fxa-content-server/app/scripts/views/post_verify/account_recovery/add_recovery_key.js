/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Post verify view that start the process of creating a secondary email via a code.
 */
import { assign } from 'underscore';
import Cocktail from 'cocktail';
import FormView from '../../form';
import ServiceMixin from '../..//mixins/service-mixin';
import Template from 'templates/post_verify/account_recovery/add_recovery_key.mustache';
import preventDefaultThen from '../../decorators/prevent_default_then';

class AddAccountRecovery extends FormView {
  template = Template;
  viewName = 'add-secondary-email';

  events = assign(this.events, {
    'click #maybe-later-btn': preventDefaultThen('clickMaybeLater'),
  });

  beforeRender() {
    const account = this.getSignedInAccount();
    if (account.isDefault()) {
      return this.replaceCurrentPage('/');
    }

    // An account can only support one recovery key at a time
    return account.checkRecoveryKeyExists().then(status => {
      if (status.exists) {
        return this.navigate(
          '/post_verify/account_recovery/verified_recovery_key'
        );
      }
    });
  }

  submit() {
    return this.navigate('/post_verify/account_recovery/confirm_password');
  }

  clickMaybeLater() {
    const account = this.getSignedInAccount();
    this.invokeBrokerMethod('afterCompleteSignIn', account);
  }
}

Cocktail.mixin(AddAccountRecovery, ServiceMixin);

export default AddAccountRecovery;
