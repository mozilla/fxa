/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import Account from 'models/account';
import BaseView from 'views/base';
import Cocktail from 'cocktail';
import Notifier from 'lib/channels/notifier';
import DeviceConnectedPoll from 'models/polls/device-connected';
import DeviceConnectedPollMixin from 'views/mixins/device-connected-poll-mixin';
import sinon from 'sinon';
import WindowMock from '../../../mocks/window';

class View extends BaseView {}

Cocktail.mixin(View, DeviceConnectedPollMixin);

describe('views/mixins/device-connected-poll-mixin', () => {
  let account;
  let notifier;
  let deviceConnectedPoll;
  let view;
  let windowMock;

  beforeEach(() => {
    account = new Account({ email: 'a@a.com' });
    notifier = new Notifier();
    windowMock = new WindowMock();

    deviceConnectedPoll = new DeviceConnectedPoll(
      {},
      {
        account,
        pollIntervalInMS: 2,
        window: windowMock,
      }
    );

    view = new View({
      notifier,
      deviceConnectedPoll,
      window: windowMock,
    });

    sinon.stub(deviceConnectedPoll, 'start').callsFake(() => {});
    sinon.stub(account, 'fetchDeviceList').callsFake(() => Promise.resolve([]));
    sinon.stub(deviceConnectedPoll, 'stop').callsFake(() => {});
  });

  describe('waitForDeviceConnected', () => {
    it('calls the callback when a device is connected to account', done => {
      view.waitForDeviceConnected(account, () => done());
      assert.isTrue(deviceConnectedPoll.start.calledOnce);

      deviceConnectedPoll.trigger('device-connected');
    });
  });

  describe('_handlePollErrors', () => {
    it('stops polling on errors', () => {
      view.waitForDeviceConnected(account);
      deviceConnectedPoll.trigger('error');
      assert.isTrue(deviceConnectedPoll.stop.calledOnce);
    });
  });

  describe('destroy', () => {
    it('stops the verification poll', () => {
      view.destroy();
      assert.isTrue(deviceConnectedPoll.stop.calledOnce);
    });
  });
});
