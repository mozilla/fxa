/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import BaseView from '../base';
import Cocktail from 'cocktail';
import DeviceBeingPairedMixin from './device-being-paired-mixin';
import PairingGraphicsMixin from '../mixins/pairing-graphics-mixin';
import Template from '../../templates/pair/auth_complete.mustache';

class PairAuthCompleteView extends BaseView {
  template = Template;

  beforeRender() {
    return this.invokeBrokerMethod('afterPairAuthComplete');
  }

  setInitialContext(context) {
    const graphicId = this.getGraphicsId();

    context.set({ graphicId });
  }
}

Cocktail.mixin(
  PairAuthCompleteView,
  DeviceBeingPairedMixin(),
  PairingGraphicsMixin
);

export default PairAuthCompleteView;
