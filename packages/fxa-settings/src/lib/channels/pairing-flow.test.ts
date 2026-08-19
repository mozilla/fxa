/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { pairingFlow } from './pairing-flow';
import { PairingChannelClient } from './pairing-channel';

jest.mock('./pairing-channel');

// FXA-13869: on a cancel, timeout, or disconnect the flow must truly close the
// channel WebSocket, not just navigate away.
describe('PairingFlowController.reset channel teardown', () => {
  beforeEach(async () => {
    // Clear the module singleton so each test starts without a client.
    await pairingFlow.reset();
    jest.clearAllMocks();
  });

  it('closes the channel and clears connection state', async () => {
    const close = jest.fn().mockResolvedValue(undefined);
    (PairingChannelClient as jest.Mock).mockImplementation(() => ({
      open: jest.fn().mockResolvedValue(undefined),
      close,
      isConnected: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    await pairingFlow.joinChannel('wss://channel.example', 'cid', 'ckey');
    expect(pairingFlow.isConnected).toBe(true);

    await pairingFlow.reset();

    expect(close).toHaveBeenCalledTimes(1);
    expect(pairingFlow.isConnected).toBe(false);
  });

  it('clears the held handshake state', async () => {
    (PairingChannelClient as jest.Mock).mockImplementation(() => ({
      open: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      isConnected: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    await pairingFlow.joinChannel('wss://channel.example', 'cid', 'ckey');
    pairingFlow.supplicantOAuth = {
      state: 's',
      scope: 'profile',
      code_challenge: 'c',
    };

    await pairingFlow.reset();

    expect(pairingFlow.channelId).toBeUndefined();
    expect(pairingFlow.channelKey).toBeUndefined();
    expect(pairingFlow.supplicantOAuth).toBeUndefined();
    expect(pairingFlow.completing).toBe(false);
  });
});
