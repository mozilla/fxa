/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Cocktail from 'cocktail';
import FormView from './form';
import ServiceMixin from './mixins/service-mixin';
import Template from 'templates/sign_in_fido.mustache';
import FlowEventsMixin from './mixins/flow-events-mixin';
import preventDefaultThen from './decorators/prevent_default_then';

const View = FormView.extend({
  template: Template,

  events: {
    'submit #login-fido': preventDefaultThen('submit'),
  },

  submit() {
    const account = this.getSignedInAccount();
    const email = this.getElementValue('#email');
    return account.fidoSignIn(email).then(() => {
      alert('Successfull Login');
      this.navigate("/settings");
    });
  },
});

Cocktail.mixin(View, FlowEventsMixin, ServiceMixin);

export default View;
