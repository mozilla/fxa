/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assign } from 'underscore';
import Cocktail from 'cocktail';
import FlowEventsMixin from '../mixins/flow-events-mixin';
import FormView from '../form';
import DeviceBeingPairedMixin from './device-being-paired-mixin';
import preventDefaultThen from '../decorators/prevent_default_then';
import Template from '../../templates/pair/supp_allow.mustache';

class PairSuppAllowView extends FormView {
  template = Template;

  events = assign(this.events, {
    'click #cancel': preventDefaultThen('cancel'),
  });

  setInitialContext(context) {
    context.set(this.model.pick('deviceName', 'email'));
  }

  submit() {
    return this.invokeBrokerMethod('afterSupplicantApprove');
  }

  cancel() {
    this.replaceCurrentPage('pair/failure');
  }
}

Cocktail.mixin(PairSuppAllowView, FlowEventsMixin, DeviceBeingPairedMixin());

export default PairSuppAllowView;
