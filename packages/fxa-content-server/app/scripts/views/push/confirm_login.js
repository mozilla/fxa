/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assign } from 'underscore';
import FormView from '../form';
import preventDefaultThen from '../decorators/prevent_default_then';
import Template from '../../templates/push/confirm_login.mustache';
import DeviceBeingPairedTemplate from '../../templates/partial/device-being-paired.mustache';
import Url from '../../lib/url';

class ConfirmPushLoginView extends FormView {
  template = Template;

  events = assign(this.events, {
    'click #change-password': preventDefaultThen('changePassword'),
  });

  initialize(options = {}) {
    const params = Url.searchParams(this.window.location.search);
    const ua = options.ua || JSON.parse(params.ua);

    const location = params.location ? JSON.parse(params.location) : {};
    const ip = options.ip || params.ip;
    this.code = options.code || params.code;

    this.deviceContext = {
      family: ua.uaBrowser,
      OS: ua.uaOS,
      ipAddress: ip,
      ...location,
    };
  }

  setInitialContext(context) {
    context.set({
      unsafeDeviceBeingPairedHTML: this.renderTemplate(
        DeviceBeingPairedTemplate,
        this.deviceContext
      ),
    });
  }

  changePassword() {}

  submit() {
    const account = this.getSignedInAccount();
    return account
      .verifySignUp(this.code)
      .then(() => {
        return this.navigate('/push/completed');
      })
      .catch((err) => {
        this.displayError(err);
      });
  }
}

export default ConfirmPushLoginView;
