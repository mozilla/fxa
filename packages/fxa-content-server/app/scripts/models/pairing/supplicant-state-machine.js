/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import PairingChannelClientErrors from '../../lib/pairing-channel-client-errors';
import { State } from './state';
import PairingFlowStateMachine from './state-machine';

/* eslint-disable no-use-before-define */

class SupplicantState extends State {
  constructor(attributes, options = {}) {
    super(attributes, options);

    this.pairingChannelClient = options.pairingChannelClient;
    this.listenTo(this.pairingChannelClient, 'close', () =>
      this.socketClosed()
    );
    this.listenTo(this.pairingChannelClient, 'error', error =>
      this.socketError(error)
    );
  }

  socketClosed() {
    this.navigate('pair/failure', {
      error: PairingChannelClientErrors.toError('CONNECTION_CLOSED'),
    });
  }

  socketError(error) {
    this.navigate('pair/failure', { error });
  }
}

class WaitForConnectionToChannelServer extends SupplicantState {
  name = 'WaitForConnectionToChannelServer';

  constructor(...args) {
    super(...args);

    this.listenTo(this.pairingChannelClient, 'connected', () => {
      this.gotoState(SendOAuthRequestWaitForAccountMetadata);
    });
  }

  socketClosed() {
    // do nothing on connection closed
  }
}

class SendOAuthRequestWaitForAccountMetadata extends SupplicantState {
  name = 'WaitForAccountMetadata';

  constructor(...args) {
    super(...args);

    this.pairingChannelClient
      .send('pair:supp:request', this.relier.getOAuthParams())
      .then(() => {
        this.listenTo(
          this.pairingChannelClient,
          'remote:pair:auth:metadata',
          data => {
            this.broker.setRemoteMetaData(data.remoteMetaData);

            this.gotoState(WaitForAuthorizations, data);
          }
        );
      });
  }
}

function onAuthAuthorize(NextState, result) {
  return Promise.resolve()
    .then(() => {
      this.relier.validateApprovalData(result);
      const { code } = result;
      this.relier.set({ code });
      this.gotoState(NextState);
    })
    .catch(err => this.trigger('error', err));
}

class WaitForAuthorizations extends SupplicantState {
  name = 'WaitForApprovals';

  constructor(...args) {
    super(...args);

    this.navigate('pair/supp/allow', {
      deviceName: this.get('deviceName'),
    });

    this.listenTo(
      this.pairingChannelClient,
      'remote:pair:auth:authorize',
      this.onAuthorityAuthorize
    );
    this.listenTo(this.notifier, 'pair:supp:authorize', () => {
      this.pairingChannelClient.send('pair:supp:authorize').then(() => {
        this.gotoState(WaitForAuthorityAuthorize);
      });
    });
  }

  onAuthorityAuthorize = onAuthAuthorize.bind(this, WaitForSupplicantAuthorize);
}

class WaitForSupplicantAuthorize extends SupplicantState {
  name = 'WaitForSupplicantAuthorize';

  constructor(...args) {
    super(...args);

    this.listenTo(this.notifier, 'pair:supp:authorize', () => {
      this.pairingChannelClient.send('pair:supp:authorize').then(() => {
        return this.gotoState(SendResultToRelier);
      });
    });
  }
}

class WaitForAuthorityAuthorize extends SupplicantState {
  name = 'WaitForAuthorityAuthorize';

  constructor(...args) {
    super(...args);
    this.navigate('pair/supp/wait_for_auth');

    this.listenTo(
      this.pairingChannelClient,
      'remote:pair:auth:authorize',
      this.onAuthorityAuthorize
    );
  }

  onAuthorityAuthorize = onAuthAuthorize.bind(this, SendResultToRelier);
}

class SendResultToRelier extends SupplicantState {
  name = 'SendResultToRelier';

  socketClosed() {
    // do nothing, this is expected to happen
  }

  constructor(...args) {
    super(...args);
    // causes the channel to be closed by the remote end.
    // The next State will do nothing.
    this.broker
      .sendCodeToRelier()
      .then(() => {
        this.gotoState(State);
      })
      .catch(err => this.trigger('error', err));
  }
}

class SupplicantStateMachine extends PairingFlowStateMachine {
  constructor(attrs, options = {}) {
    super(attrs, options);

    this.createState(WaitForConnectionToChannelServer);
  }
}

export default SupplicantStateMachine;

export {
  SupplicantState,
  WaitForConnectionToChannelServer,
  SendOAuthRequestWaitForAccountMetadata,
  WaitForAuthorizations,
  WaitForSupplicantAuthorize,
  WaitForAuthorityAuthorize,
  SendResultToRelier,
  SupplicantStateMachine,
};

/* eslint-enable no-use-before-define */
