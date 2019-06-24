/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This template serves as a generic landing zone for a successful pairing
// Clients and reliers can choose to show this page as part of their WebUI after the pairing flow completes

import BaseView from '../base';
import Cocktail from 'cocktail';
import PairingGraphicsMixin from '../mixins/pairing-graphics-mixin';
import Template from '../../templates/pair/success.mustache';

class PairAuthCompleteView extends BaseView {
  template = Template;

  setInitialContext(context) {
    const graphicId = this.getGraphicsId();

    context.set({ graphicId });
  }
}

Cocktail.mixin(PairAuthCompleteView, PairingGraphicsMixin);

export default PairAuthCompleteView;
