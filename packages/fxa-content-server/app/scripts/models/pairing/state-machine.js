/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Model } from 'backbone';

class PairingFlowStateMachine extends Model {
  constructor(attrs, options = {}) {
    super(attrs, options);

    this.broker = options.broker;
    this.pairingChannelClient = options.pairingChannelClient;
    this.notifier = options.notifier;
    this.relier = options.relier;
  }

  createState(StateConstructor, attrs = {}) {
    if (this.state) {
      this.state.destroy();
    }

    this.state = new StateConstructor(attrs, {
      broker: this.broker,
      notifier: this.notifier,
      pairingChannelClient: this.pairingChannelClient,
      parent: this,
      relier: this.relier,
    });

    this.listenTo(this.state, 'goto.state', this.createState);
  }
}

export default PairingFlowStateMachine;
