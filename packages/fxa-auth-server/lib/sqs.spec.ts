/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export {};

import sinon from 'sinon';

const log = { error: sinon.stub() };

interface SQSQueue {
  sqs: Record<string, unknown>;
  start(): void;
}

let SQSReceiver: ReturnType<typeof require>;
let statsd: { timing: sinon.SinonStub };
let testQueue: SQSQueue;

describe('SQSReceiver', () => {
  beforeEach(() => {
    statsd = { timing: sinon.stub() };
    SQSReceiver = require('./sqs')(log, statsd);
    testQueue = new SQSReceiver('testo', [
      'https://sqs.testo.meows.xyz/fxa/quux',
    ]);
    const receiveStub = sinon.stub();
    receiveStub.onFirstCall().callsFake(
      (_qParams: Record<string, unknown>, cb: (err: null, data: { Messages: string[] }) => void) => {
        cb(null, { Messages: [JSON.stringify({ Body: 'SYN' })] });
      }
    );
    receiveStub.returns(null);
    testQueue.sqs = {
      receiveMessage: receiveStub,
      deleteMessage: (_sParams: Record<string, unknown>, cb: (err: null) => void) => {
        cb(null);
      },
    };
  });

  it('should collect perf stats with statsd when it is present', () => {
    testQueue.start();
    expect(statsd.timing.callCount).toBe(2);
    expect(statsd.timing.args[0][0]).toBe('sqs.quux.receive');
    expect(typeof statsd.timing.args[0][1]).toBe('number');
    expect(statsd.timing.args[1][0]).toBe('sqs.quux.delete');
    expect(typeof statsd.timing.args[1][1]).toBe('number');
  });
});
