/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import path from 'path';
import proxyquire from 'proxyquire';
import rimraf from 'rimraf';
import sinon from 'sinon';

const OUTPUT_DIR = path.resolve(__dirname, 'test_output');

describe.skip('bulk-mailer', () => {
  const userRecords = ['a', 'b', 'c'];
  const normalizedUserRecords = ['a', 'b', 'c'];

  const normalizerStub = {
    normalize: sinon.spy(() => normalizedUserRecords),
  };

  const UserRecordNormalizerMock = function () {
    return normalizerStub;
  };
  const readUserRecordsSpy = sinon.spy(() => userRecords);
  const sendEmailBatchesSpy = sinon.spy(() => {});

  const sendersMock = {
    email: {
      sendVerifyEmail: sinon.spy(),
    },
  };

  const createSendersSpy = sinon.spy(() => {
    return Promise.resolve(sendersMock);
  });

  before(() => {
    rimraf.sync(OUTPUT_DIR);

    const bulkMailer = proxyquire('../../../scripts/bulk-mailer/index', {
      './read-user-records': readUserRecordsSpy,
      './normalize-user-records': UserRecordNormalizerMock,
      './send-email-batches': sendEmailBatchesSpy,
      '../../lib/senders': createSendersSpy,
    });

    return bulkMailer(
      'input.json',
      'sendVerifyEmail',
      2,
      1000,
      false,
      OUTPUT_DIR
    );
  });

  after(() => {
    rimraf.sync(OUTPUT_DIR);
  });

  it('calls readUserRecords as expected', () => {
    assert.isTrue(readUserRecordsSpy.calledOnce);
    assert.equal(readUserRecordsSpy.args[0][0], 'input.json');
  });

  it('calls normalize as expected', () => {
    assert.isTrue(normalizerStub.normalize.calledOnce);
    assert.strictEqual(normalizerStub.normalize.args[0][0], userRecords);
  });

  it('calls sendEmailBatches as expected', () => {
    assert.isTrue(sendEmailBatchesSpy.called);

    const expectedBatches = [['a', 'b'], ['c']];
    assert.deepEqual(sendEmailBatchesSpy.args[0][0], expectedBatches);
    assert.equal(sendEmailBatchesSpy.args[0][1], 1000);
    assert.isFunction(sendEmailBatchesSpy.args[0][2]);
    assert.isObject(sendEmailBatchesSpy.args[0][3]);
    assert.isTrue(sendEmailBatchesSpy.args[0][4]);
  });

  it('sendDelegate is hooked up correctly', () => {
    const userInfo = { emails: ['a'] };
    sendEmailBatchesSpy.args[0][2](userInfo);
    assert.isTrue(sendersMock.email.sendVerifyEmail.calledOnce);
    assert.deepEqual(sendersMock.email.sendVerifyEmail.args[0][0], ['a']);
    assert.strictEqual(sendersMock.email.sendVerifyEmail.args[0][1], userInfo);
  });
});
