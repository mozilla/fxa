/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Account from 'models/account';
import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import DeviceConnectedPoll from 'models/polls/device-connected';
import sinon from 'sinon';
import WindowMock from '../../../mocks/window';

describe('models/polls/device-connected', () => {
  let account;
  let poll;
  let windowMock;
  const mockDevice = [
    {
      id: '20772eb21c624e88aea046fe97aeee7c',
      isCurrentDevice: true,
      lastAccessTime: 1589301164155,
      location: {},
      name: 'vijaybudhram’s Firefox on vijaybudhram-ms',
      type: 'desktop',
      lastAccessTimeFormatted: '3 hours ago',
    },
  ];
  const mockDevices = mockDevice.concat({
    id: '315d792b328ea9d183a1566cb57e0a3c',
    isCurrentDevice: false,
    lastAccessTime: 1588702529206,
    location: {},
    name: 'vijaybudhram’s Firefox on vijaybudhram-ms',
    type: 'mobile',
    lastAccessTimeFormatted: '7 days ago',
  });

  beforeEach(() => {
    account = new Account();
    windowMock = new WindowMock();
    sinon.stub(windowMock, 'setTimeout').callsFake(func => func());

    poll = new DeviceConnectedPoll(
      {},
      {
        account,
        pollIntervalInMS: 2,
        window: windowMock,
      }
    );
  });

  describe('waitForDeviceConnected', () => {
    describe('with a valid `sessionToken`', () => {
      beforeEach(() => {
        sinon.stub(account, 'fetchDeviceList').callsFake(() => {
          if (account.fetchDeviceList.callCount === 3) {
            return Promise.resolve(mockDevices);
          }
          return Promise.resolve(mockDevice);
        });

        return new Promise((resolve, reject) => {
          console.log('here');
          poll.on('device-connected', () => resolve());
          poll.on('error', reject);
          poll.start();
        });
      });

      it('polls until /account/devices returns new device', () => {
        assert.equal(account.fetchDeviceList.callCount, 3);
      });
    });

    describe('stops polling on error', () => {
      beforeEach(() => {
        sinon
          .stub(account, 'fetchDeviceList')
          .callsFake(() => Promise.reject(AuthErrors.toError('INVALID_TOKEN')));

        return new Promise((resolve, reject) => {
          poll.on('device-connected', () => reject(assert.catch()));
          poll.on('error', _err => {
            resolve();
          });
          poll.start();
        });
      });

      it('stops polling', () => {
        assert.isFalse(poll._isWaiting);
      });
    });
  });
});
