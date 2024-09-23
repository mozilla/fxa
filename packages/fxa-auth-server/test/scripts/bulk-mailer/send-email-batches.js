/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import proxyquireModule from 'proxyquire';
import sinon from 'sinon';
import retry from 'async-retry';

const proxyquire = proxyquireModule.noCallThru();

describe('send-email-batches', () => {
  const batches = [
    ['a', 'b'],
    ['c', 'd'],
  ];

  const log = {
    error: sinon.spy(),
    info: sinon.spy(),
  };
  let sendEmailBatchSpy;
  const sender = {};

  let totalTimeMS;

  const DELAY_BETWEEN_BATCHES_MS = 120;

  before(async () => {
    sendEmailBatchSpy = sinon.spy((batch) => {
      if (batch.indexOf('c') > -1) {
        return Promise.resolve({
          errorCount: 1,
          successCount: batch.length - 1,
        });
      } else {
        return Promise.resolve({
          errorCount: 0,
          successCount: batch.length,
        });
      }
    });

    const sendEmailBatches = proxyquire(
      '../../../scripts/bulk-mailer/send-email-batches',
      {
        './send-email-batch': sendEmailBatchSpy,
      }
    );

    const startTime = Date.now();
    await sendEmailBatches(
      batches,
      DELAY_BETWEEN_BATCHES_MS,
      sender,
      log,
      false
    );
    totalTimeMS = Date.now() - startTime;
  });

  it('calls log as expected', () => {
    assert.equal(log.info.callCount, 2);
    assert.equal(log.info.args[0][0].op, 'send.begin');

    assert.equal(log.info.args[1][0].op, 'send.complete');
    assert.equal(log.info.args[1][0].count, 4);
    assert.equal(log.info.args[1][0].successCount, 3);
    assert.equal(log.info.args[1][0].errorCount, 1);
    assert.equal(log.info.args[1][0].unsentCount, 0);
  });

  it('calls sendEmailBatchSpy as expected', () => {
    assert.equal(sendEmailBatchSpy.callCount, 2);

    assert.deepEqual(sendEmailBatchSpy.args[0][0], ['a', 'b']);
    assert.strictEqual(sendEmailBatchSpy.args[0][1], sender);
    assert.strictEqual(sendEmailBatchSpy.args[0][2], log);

    assert.deepEqual(sendEmailBatchSpy.args[1][0], ['c', 'd']);
    assert.strictEqual(sendEmailBatchSpy.args[1][1], sender);
  });

  it('uses a delay between batches', async () => {
    await retry(
      async () => {
        assert.isAbove(totalTimeMS, 80);
      },
      {
        retries: 10,
        minTimeout: 20,
      }
    );
  }).timeout(15000);
});
