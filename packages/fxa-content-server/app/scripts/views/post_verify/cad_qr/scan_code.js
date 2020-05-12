/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assign } from 'underscore';
import Cocktail from 'cocktail';
import FormView from '../../form';
import Template from 'templates/post_verify/cad_qr/scan_code.mustache';
import preventDefaultThen from '../../decorators/prevent_default_then';

class ScanCode extends FormView {
  template = Template;
  viewName = 'scan-code';

  events = assign(this.events, {
    'click #use-sms': preventDefaultThen('clickUseSms'),
  });

  clickUseSms() {
    return this.navigate('/connect_another_device');
  }
}

Cocktail.mixin(ScanCode);

export default ScanCode;
