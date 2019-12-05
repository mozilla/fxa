/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import FxDesktopV2AuthenticationBroker from 'models/auth_brokers/fx-desktop-v2';
import NullChannel from 'lib/channels/null';
import sinon from 'sinon';
import WindowMock from '../../../mocks/window';

describe('models/auth_brokers/fx-desktop-v2', () => {
  let broker;
  let channelMock;
  let windowMock;

  beforeEach(() => {
    windowMock = new WindowMock();
    channelMock = new NullChannel();
    channelMock.send = () => {
      return Promise.resolve();
    };
    sinon.spy(channelMock, 'send');

    broker = new FxDesktopV2AuthenticationBroker({
      channel: channelMock,
      window: windowMock,
    });
    sinon.stub(broker, '_hasRequiredLoginFields').callsFake(() => true);
  });

  it('has the expected capabilities', () => {
    assert.isTrue(broker.getCapability('openWebmailButtonVisible'));
  });
});
