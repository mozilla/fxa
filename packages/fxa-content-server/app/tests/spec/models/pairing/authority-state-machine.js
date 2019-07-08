/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Notifier from 'lib/channels/notifier';
import sinon from 'sinon';

import {
  WaitForAuthorizations,
  WaitForSupplicantAuthorize,
  WaitForAuthorityAuthorize,
  PairAuthComplete,
  PairAuthFailure,
  AuthorityStateMachine,
} from 'models/pairing/authority-state-machine';

describe('models/auth_brokers/pairing/authority-state-machine', function() {
  let state;
  let notifier;

  beforeEach(() => {
    notifier = new Notifier();
  });

  describe('WaitForAuthorizations', () => {
    it('transitions to WaitForAuthorityAuthorize', done => {
      state = new WaitForAuthorizations(
        {},
        {
          notifier,
        }
      );
      sinon.spy(state, 'gotoState');

      notifier.trigger('pair:supp:authorize');

      setTimeout(() => {
        assert.isTrue(
          state.gotoState.calledOnceWith(WaitForAuthorityAuthorize)
        );
        done();
      }, 1);
    });

    it('transitions to WaitForSupplicantAuthorize', done => {
      state = new WaitForAuthorizations(
        {},
        {
          notifier,
        }
      );
      sinon.spy(state, 'gotoState');

      notifier.trigger('pair:auth:authorize');

      setTimeout(() => {
        assert.isTrue(
          state.gotoState.calledOnceWith(WaitForSupplicantAuthorize)
        );
        done();
      }, 1);
    });
  });

  describe('WaitForSupplicantAuthorize', () => {
    it('transitions to PairAuthComplete', done => {
      state = new WaitForSupplicantAuthorize(
        {},
        {
          notifier,
        }
      );
      sinon.spy(state, 'gotoState');

      notifier.trigger('pair:supp:authorize');

      setTimeout(() => {
        assert.isTrue(state.gotoState.calledOnceWith(PairAuthComplete));
        done();
      }, 1);
    });
  });

  describe('PairAuthComplete', () => {
    it('transitions to ', () => {
      state = new PairAuthComplete(
        {},
        {
          notifier,
        }
      );

      assert.equal(state.constructor.name, 'PairAuthComplete');
    });
  });

  describe('PairAuthFailure', () => {
    it('transitions to ', () => {
      state = new PairAuthFailure(
        {},
        {
          notifier,
        }
      );

      assert.equal(state.constructor.name, 'PairAuthFailure');
    });
  });

  describe('AuthorityStateMachine', () => {
    it('has heartbeatError', () => {
      state = new AuthorityStateMachine(
        {},
        {
          notifier,
        }
      );
      sinon.spy(state, 'createState');

      state.heartbeatError();
      assert.isTrue(state.createState.calledOnceWith(PairAuthFailure));
    });
  });
});
