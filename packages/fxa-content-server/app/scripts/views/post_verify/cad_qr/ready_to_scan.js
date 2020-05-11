/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assign } from 'underscore';
import Cocktail from 'cocktail';
import FormView from '../../form';
import Template from 'templates/post_verify/cad_qr/ready_to_scan.mustache';
import preventDefaultThen from '../../decorators/prevent_default_then';
import { MOZ_ORG_SYNC_GET_STARTED_LINK } from '../../../lib/constants';

class ReadyToScan extends FormView {
  template = Template;
  viewName = 'ready-to-scan';

  events = assign(this.events, {
    'click #use-sms': preventDefaultThen('clickUseSms'),
  });

  setInitialContext(context) {
    context.set({
      maybeLaterLink: MOZ_ORG_SYNC_GET_STARTED_LINK,
    });
  }

  submit() {
    this.navigate('/post_verify/cad_qr/scan_code');
  }

  clickUseSms() {
    return this.navigate('/connect_another_device');
  }
}

Cocktail.mixin(ReadyToScan);

export default ReadyToScan;
