/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import sinon from 'sinon';
import { State } from 'models/pairing/state';
import PairingFlowStateMachine from 'models/pairing/state-machine';

describe('models/auth_brokers/pairing/state-machine', function () {
  let machine;
  beforeEach(function () {
    machine = new PairingFlowStateMachine();
  });

  it('is a machine', () => {
    assert.equal(machine.constructor.name, 'PairingFlowStateMachine');
  });

  describe('createState', () => {
    it('creates a state', () => {
      sinon.spy(machine, 'listenTo');
      machine.createState(State);
      assert.equal(machine.state.constructor.name, 'State');
      assert.isTrue(machine.listenTo.calledOnce);
    });
  });
});
