/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assign } from 'underscore';
import Cocktail from 'cocktail';
import DeviceBeingPairedMixin from './device-being-paired-mixin';
import FormView from '../form';
import { preventDefaultThen } from '../base';
import Template from '../../templates/pair/auth_allow.mustache';

class PairAuthAllowView extends FormView {
  template = Template;

  events = assign(this.events, {
    'click #cancel': preventDefaultThen('cancel')
  });

  initialize () {
    this.listenTo(this.broker, 'error', this.displayError);
  }

  submit () {
    return this.invokeBrokerMethod('afterPairAuthAllow');
  }

  cancel () {
    this.replaceCurrentPage('pair/failure');
    return this.invokeBrokerMethod('afterPairAuthDecline');
  }
}

Cocktail.mixin(
  PairAuthAllowView,
  DeviceBeingPairedMixin(),
);

export default PairAuthAllowView;
