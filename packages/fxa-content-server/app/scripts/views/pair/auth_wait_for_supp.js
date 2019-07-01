/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import BaseView from '../base';
import Cocktail from 'cocktail';
import DeviceBeingPairedMixin from './device-being-paired-mixin';
import Template from '../../templates/pair/auth_wait_for_supp.mustache';

class PairAuthWaitForSupp extends BaseView {
  template = Template;

  initialize(options) {
    super.initialize(options);

    this.listenTo(this.model, 'change', this.render);
    this.listenTo(this.broker, 'error', this.displayError);
  }
}

Cocktail.mixin(PairAuthWaitForSupp, DeviceBeingPairedMixin());

export default PairAuthWaitForSupp;
