/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assign } from 'underscore';
import Cocktail from 'cocktail';
import FormView from '../../form';
import Template from 'templates/post_verify/cad_qr/get_started.mustache';
import preventDefaultThen from '../../decorators/prevent_default_then';

class GetStarted extends FormView {
  template = Template;
  viewName = 'get-started';

  events = assign(this.events, {
    'click #maybe-later-btn': preventDefaultThen('clickMaybeLater'),
  });

  submit() {
    return this.navigate('/post_verify/cad_qr/ready_to_scan');
  }

  clickMaybeLater() {
    return this.navigate('/connect_another_device');
  }
}

Cocktail.mixin(GetStarted);

export default GetStarted;
