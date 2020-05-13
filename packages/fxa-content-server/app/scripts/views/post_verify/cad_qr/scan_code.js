/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assign } from 'underscore';
import Cocktail from 'cocktail';
import FormView from '../../form';
import Template from 'templates/post_verify/cad_qr/scan_code.mustache';
import preventDefaultThen from '../../decorators/prevent_default_then';
import DeviceConnectedPollMixin from '../../mixins/device-connected-poll-mixin';

class ScanCode extends FormView {
  template = Template;
  viewName = 'scan-code';

  events = assign(this.events, {
    'click #use-sms-link': preventDefaultThen('clickUseSms'),
  });

  _onConnected(device) {
    return this.navigate('/post_verify/cad_qr/connected', {
      device,
      showSuccessMessage: true,
    });
  }

  beforeRender() {
    const account = this.getSignedInAccount();

    // We can only poll for new devices if a user is logged into a session.
    // Users that are not logged can not proceed to the next screen.
    if (!account.isDefault()) {
      this.waitForDeviceConnected(account, this._onConnected);
    }
  }

  clickUseSms() {
    return this.navigate('/connect_another_device');
  }
}

Cocktail.mixin(ScanCode, DeviceConnectedPollMixin);

export default ScanCode;
