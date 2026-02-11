/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const sinon = require('sinon');

const ROOT_DIR = '../..';
let SQSReceiver, statsd, testQueue;
const log = { error: sinon.stub() };

describe('SQSReceiver', () => {
  beforeEach(() => {
    statsd = { timing: sinon.stub() };
    SQSReceiver = require(`${ROOT_DIR}/lib/sqs`)(log, statsd);
    testQueue = new SQSReceiver('testo', [
      'https://sqs.testo.meows.xyz/fxa/quux',
    ]);
    const receiveStub = sinon.stub();
    receiveStub.onFirstCall().callsFake((qParams, cb) => {
      cb(null, { Messages: [JSON.stringify({ Body: 'SYN' })] });
    });
    receiveStub.returns(null);
    testQueue.sqs = {
      receiveMessage: receiveStub,
      deleteMessage: (sParams, cb) => {
        cb(null);
      },
    };
  });

  it('should collect perf stats with statsd when it is present', () => {
    testQueue.start();
    assert.equal(statsd.timing.callCount, 2, 'statsd was called twice');
    assert.equal(
      statsd.timing.args[0][0],
      'sqs.quux.receive',
      'the first stat name was correct'
    );
    assert.equal(
      typeof statsd.timing.args[0][1],
      'number',
      'the first stat value was a number'
    );
    assert.equal(
      statsd.timing.args[1][0],
      'sqs.quux.delete',
      'the second stat name was correct'
    );
    assert.equal(
      typeof statsd.timing.args[1][1],
      'number',
      'the second stat value was a number'
    );
  });
});
