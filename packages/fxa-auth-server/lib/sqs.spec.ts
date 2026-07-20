/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const log = { error: jest.fn() };

interface SQSQueue {
  sqs: Record<string, unknown>;
  start(): void;
}

let SQSReceiver: ReturnType<typeof require>;
let statsd: { timing: jest.Mock };
let testQueue: SQSQueue;

describe('SQSReceiver', () => {
  beforeEach(() => {
    statsd = { timing: jest.fn() };
    SQSReceiver = require('./sqs')(log, statsd);
    testQueue = new SQSReceiver('testo', [
      'https://sqs.testo.meows.xyz/fxa/quux',
    ]);
    const receiveStub = jest
      .fn()
      .mockImplementationOnce(
        (
          _qParams: Record<string, unknown>,
          cb: (err: null, data: { Messages: string[] }) => void
        ) => {
          cb(null, { Messages: [JSON.stringify({ Body: 'SYN' })] });
        }
      )
      .mockReturnValue(null);
    testQueue.sqs = {
      receiveMessage: receiveStub,
      deleteMessage: (
        _sParams: Record<string, unknown>,
        cb: (err: null) => void
      ) => {
        cb(null);
      },
    };
  });

  it('should collect perf stats with statsd when it is present', () => {
    testQueue.start();
    expect(statsd.timing).toHaveBeenCalledTimes(2);
    expect(statsd.timing).toHaveBeenNthCalledWith(
      1,
      'sqs.quux.receive',
      expect.any(Number)
    );
    expect(statsd.timing).toHaveBeenNthCalledWith(
      2,
      'sqs.quux.delete',
      expect.any(Number)
    );
  });
});
