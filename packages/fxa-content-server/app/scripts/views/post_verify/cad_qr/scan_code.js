/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assign } from 'underscore';
import Cocktail from 'cocktail';
import FormView from '../../form';
import Template from 'templates/post_verify/cad_qr/scan_code.mustache';
import preventDefaultThen from '../../decorators/prevent_default_then';
import DeviceConnectedPollMixin from '../../mixins/device-connected-poll-mixin';

const QR_IMG_SELECTOR = '#graphic-cad-qr-code';

class ScanCode extends FormView {
  template = Template;
  viewName = 'scan-code';

  events = assign(this.events, {
    'click #use-sms-link': preventDefaultThen('clickUseSms'),
  });

  initialize() {
    // Override the default poll time (6s) in functional tests
    if (this.broker.isAutomatedBrowser()) {
      this.DEVICE_CONNECTED_POLL_IN_MS = 500;
    }
  }

  _onConnected(device) {
    this.logFlowEvent('device-connected', this.viewName);
    return this.navigate('/post_verify/cad_qr/connected', {
      device,
      showSuccessMessage: true,
    });
  }

  afterRender() {
    const account = this.getSignedInAccount();

    // We can only poll for new devices if a user is logged into a session.
    // Users that are not logged can not proceed to the next screen.
    // A "default" QR code image will be shown that doesn't prefill any
    // login form
    if (account.isDefault()) {
      return;
    }

    return account
      .createSigninCode()
      .then((resp) => {
        this.$(QR_IMG_SELECTOR).attr('src', resp.installQrCode);
      })
      .then(() => {
        this.waitForDeviceConnected(account, this._onConnected);
      });
  }

  clickUseSms() {
    return this.navigate('/sms');
  }
}

Cocktail.mixin(ScanCode, DeviceConnectedPollMixin);

export default ScanCode;
