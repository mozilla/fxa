/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assign } from 'underscore';
import Cocktail from 'cocktail';
import FlowEventsMixin from './../../mixins/flow-events-mixin';
import FormView from '../../form';
import Template from 'templates/post_verify/cad_qr/connected.mustache';
import preventDefaultThen from '../../decorators/prevent_default_then';
import { MOZ_ORG_SYNC_GET_STARTED_LINK } from '../../../lib/constants';

class ScanCode extends FormView {
  template = Template;
  viewName = 'connected';

  events = assign(this.events, {
    'click #done-link': preventDefaultThen('clickDoneLink'),
    'click #use-sms-link': preventDefaultThen('clickUseSms'),
  });

  setInitialContext(context) {
    context.set({
      doneLink: MOZ_ORG_SYNC_GET_STARTED_LINK,
    });
  }

  submit() {
    return this.navigate('/post_verify/cad_qr/ready_to_scan');
  }

  clickUseSms() {
    return this.navigate('/sms');
  }
}

Cocktail.mixin(ScanCode, FlowEventsMixin);

export default ScanCode;
