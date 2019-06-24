/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import sinon from 'sinon';
import { State } from 'models/pairing/state';
import Notifier from 'lib/channels/notifier';

describe('models/auth_brokers/pairing/state', function() {
  describe('State', () => {
    let state;
    let notifier;

    beforeEach(() => {
      notifier = new Notifier();
      state = new State(
        {},
        {
          notifier,
        }
      );
    });

    it('can destroy', () => {
      sinon.spy(state, 'stopListening');
      state.destroy();
      assert.isTrue(state.stopListening.calledOnce);
    });

    it('can gotoState', () => {
      sinon.spy(state, 'trigger');
      state.gotoState(State);
      assert.isTrue(state.trigger.calledOnceWith('goto.state', State));
    });

    it('navigates', () => {
      sinon.spy(state.notifier, 'trigger');
      state.navigate('pair/path');
      assert.isTrue(
        state.notifier.trigger.calledOnceWith('navigate', {
          nextViewData: {},
          routerOptions: { replace: true, trigger: true },
          url: 'pair/path',
        })
      );
    });
  });
});
