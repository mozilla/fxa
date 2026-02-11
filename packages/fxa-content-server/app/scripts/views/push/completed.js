/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import FormView from '../form';
import Template from '../../templates/push/completed.mustache';

class CompletedPushLoginView extends FormView {
  template = Template;

  beforeRender() {
    const account = this.getSignedInAccount();
    // If no user is logged in redirect to the login page and set the `redirectTo` property
    // to current url. After a user has logged in, they will be redirected back to this page.
    if (account && account.isDefault()) {
      this.relier.set('redirectTo', this.window.location.href);
      return this.navigate('/');
    }
  }
}

export default CompletedPushLoginView;
