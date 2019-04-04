/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import Constants from 'lib/constants';
import FxFirstrunV2AuthenticationBroker from 'models/auth_brokers/fx-firstrun-v2';
import Notifier from 'lib/channels/notifier';
import NullChannel from 'lib/channels/null';
import sinon from 'sinon';
import WindowMock from '../../../mocks/window';

describe('models/auth_brokers/fx-firstrun-v2', () => {
  let broker;
  let iframeChannel;
  let notifier;
  let windowMock;

  beforeEach(function () {
    notifier = new Notifier();
    iframeChannel = new NullChannel();
    sinon.spy(iframeChannel, 'send');
    windowMock = new WindowMock();

    broker = new FxFirstrunV2AuthenticationBroker({
      iframeChannel,
      notifier,
      window: windowMock
    });
  });

  it('has all sync content types', () => {
    assert.equal(broker.defaultCapabilities.chooseWhatToSyncWebV1.engines, Constants.DEFAULT_DECLINED_ENGINES);
  });

  describe('capabilities', () => {
    it('has the `chooseWhatToSyncWebV1` capability by default', function () {
      assert.isTrue(broker.hasCapability('chooseWhatToSyncWebV1'));
    });
  });

  describe('notifications', () => {
    function testNotificationCausesSend(notification, expectedSentMessage) {
      assert.isFalse(iframeChannel.send.calledWith(expectedSentMessage));
      notifier.trigger(notification);
      assert.isTrue(iframeChannel.send.calledWith(expectedSentMessage));
    }

    it('form.engaged sends a form_engaged message to the iframe parent', () => {
      testNotificationCausesSend('form.engaged', 'form_engaged');
    });

    it('show-view sends a `navigated` message to the iframe parent', () => {
      assert.isFalse(iframeChannel.send.calledWith('navigated'));
      notifier.trigger('show-view', null, { currentPage: 'signin' });
      assert.isTrue(iframeChannel.send.calledWith('navigated', { url: 'signin' }));
    });

    it('show-child-view sends a `navigated` message to the iframe parent', () => {
      assert.isFalse(iframeChannel.send.calledWith('navigated'));
      notifier.trigger('show-child-view', null, null, { currentPage: 'signup' });
      assert.isTrue(iframeChannel.send.calledWith('navigated', { url: 'signup' }));
    });
  });
});
