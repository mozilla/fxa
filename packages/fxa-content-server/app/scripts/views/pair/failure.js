/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import FormView from '../form';
import Template from '../../templates/pair/failure.mustache';
import { assign } from 'underscore';
import preventDefaultThen from '../decorators/prevent_default_then';

class PairFailureView extends FormView {
  template = Template;

  events = assign(this.events, {
    'click #signin-button': preventDefaultThen('clickSignin'),
  });

  setInitialContext(context) {
    const showSigninLink = !!this.model.get('searchParams');
    context.set({
      showSigninLink,
    });
  }

  clickSignin() {
    const params = this.model.get('searchParams');

    // We replace the `email` with `prefillEmail` so that the email
    // first page gets populated correctly.
    const email = params.get('email');
    params.delete('email');
    params.set('prefillEmail', email);
    window.location.href = `${window.location.origin}${params}`;
  }
}

export default PairFailureView;
