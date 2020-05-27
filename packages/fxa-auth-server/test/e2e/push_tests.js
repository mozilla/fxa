/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const config = require('../../config').getProperties();
const { mockDB, mockLog } = require('../mocks');
const { PushManager } = require('../push_helper');

const mockUid = 'foo';

describe('e2e/push', () => {
  let pushManager;

  before(() => {
    pushManager = new PushManager({
      server: 'wss://push.services.mozilla.com/',
      channelId: '9500b5e6-9954-40d5-8ac1-3920832e781e',
    });
  });

  it('sendPush sends notifications using a real push server', () => {
    return pushManager.getSubscription().then((subscription) => {
      let count = 0;
      const thisSpyLog = mockLog({
        info(op, log) {
          if (op === 'push.send.success') {
            count++;
          }
        },
      });

      const push = require('../../lib/push')(thisSpyLog, mockDB(), config, { increment: () => {} });
      const options = {
        data: Buffer.from('foodata'),
      };
      return push
        .sendPush(
          mockUid,
          [
            {
              id: '0f7aa00356e5416e82b3bef7bc409eef',
              isCurrentDevice: true,
              lastAccessTime: 1449235471335,
              name: 'My Phone',
              type: 'mobile',
              pushCallback: subscription.endpoint,
              pushPublicKey:
                'BBXOKjUb84pzws1wionFpfCBjDuCh4-s_1b52WA46K5wYL2gCWEOmFKWn_NkS5nmJwTBuO8qxxdjAIDtNeklvQc',
              pushAuthKey: 'GSsIiaD2Mr83iPqwFNK4rw',
              pushEndpointExpired: false,
            },
          ],
          'accountVerify',
          options
        )
        .then(() => {
          assert.equal(
            thisSpyLog.error.callCount,
            0,
            'No errors should have been logged'
          );
          assert.equal(
            count,
            1,
            'log.info::push.send.success was called once'
          );
        });
    });
  });
});
