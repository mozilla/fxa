/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { State } from './state';
import PairingFlowStateMachine from './state-machine';
/* eslint-disable no-use-before-define */

// Unlike the Supplicant, the Authority web code does not speak directly to the channel server,
// all communication is done via the WebChannels in the browser.
class WaitForAuthorizations extends State {
  name = 'WaitForAuthorizations';

  constructor(...args) {
    super(...args);

    this.navigate('pair/auth/allow');

    // We listen for both messages at the same time because the pairing process
    // needs to be authorized on both ends to succeed.
    this.listenTo(this.notifier, 'pair:supp:authorize', () => {
      this.gotoState(WaitForAuthorityAuthorize);
    });
    this.listenTo(this.notifier, 'pair:auth:authorize', (result) => {
      this.gotoState(WaitForSupplicantAuthorize, result);
    });
  }
}

class WaitForSupplicantAuthorize extends State {
  name = 'WaitForSupplicantAuthorize';

  constructor(...args) {
    super(...args);

    this.navigate('/pair/auth/wait_for_supp');
    this.listenTo(this.notifier, 'pair:supp:authorize', () => {
      this.gotoState(PairAuthComplete, {});
    });
  }
}

class WaitForAuthorityAuthorize extends State {
  name = 'WaitForAuthApprove';

  constructor(...args) {
    super(...args);

    this.listenTo(this.notifier, 'pair:auth:authorize', () => {
      this.gotoState(PairAuthComplete);
    });
  }
}

class PairAuthComplete extends State {
  constructor(...args) {
    super(...args);

    this.navigate('pair/auth/complete');
  }
}

class PairAuthFailure extends State {
  constructor(...args) {
    super(...args);

    this.navigate('pair/failure');
  }
}

class AuthorityStateMachine extends PairingFlowStateMachine {
  constructor(attrs, options = {}) {
    super(attrs, options);

    this.createState(WaitForAuthorizations);
  }

  heartbeatError(error) {
    this.createState(PairAuthFailure, { error });
  }
}

export default AuthorityStateMachine;

export {
  WaitForAuthorizations,
  WaitForSupplicantAuthorize,
  WaitForAuthorityAuthorize,
  PairAuthComplete,
  PairAuthFailure,
  AuthorityStateMachine,
};
/* eslint-enable no-use-before-define */
