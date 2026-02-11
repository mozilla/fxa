/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A mock for pairing components
import sinon from 'sinon';

const defaultChannelMock = {
  addEventListener: () => sinon.spy(),
  close: sinon.spy(() => Promise.resolve()),
  send: sinon.spy(() => Promise.resolve()),
};

export function mockPairingChannel(channelApi = defaultChannelMock) {
  return Promise.resolve().then(() => {
    return {
      PairingChannel: {
        connect: () => {
          return Promise.resolve(channelApi);
        },
      },
    };
  });
}
