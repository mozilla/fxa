/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';

import { Container } from 'typedi';
import 'mocha';
import { assert } from 'chai';
import sinon from 'sinon';
import { EventEmitter, once } from 'events';

import { QueueProcessor } from '../../lib/pubsub';

import Config from '../../config';

const queueConfig = Config.getProperties().queues;

const sandbox = sinon.createSandbox();

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('PubSub', () => {
  describe('QueueProcessor', () => {
    let queueProcessor: any;
    let messageProcessor: any;

    beforeEach(() => {
      messageProcessor = {
        processMessage: sandbox.stub().returns({ message: 'test' })
      };
      queueProcessor = Container.get(QueueProcessor);
      queueProcessor.messageProcessor = messageProcessor;
    });

    afterEach(() => {
      Container.reset(QueueProcessor);
      sandbox.reset();
    });

    describe('pullMessageBatch', () => {
      it('should return messages', async () => {
        queueProcessor.subClient = { pull: sandbox.stub().resolves([{ receivedMessages: [] }]) };
        const results = await queueProcessor.pullMessageBatch();
        sinon.assert.calledOnce(queueProcessor.subClient.pull);
        assert.deepEqual(results, []);
      });
    });

    describe('handleMessageError', () => {
      let mockErr: { message: string };
      let mockScope: { setContext: sinon.SinonStub };
      let captureExceptionSpy: sinon.SinonSpy;
      let withScopeStub: sinon.SinonStub;
      let cb: (scope: typeof mockScope) => void;

      beforeEach(() => {
        mockErr = { message: 'oops' };
        mockScope = { setContext: sandbox.stub() };
        captureExceptionSpy = sandbox.spy(queueProcessor.sentry, 'captureException');
        withScopeStub = sandbox
          .stub(queueProcessor.sentry, 'withScope')
          .callsFake(callback => (cb = callback));
      });

      afterEach(() => {
        captureExceptionSpy.restore();
        withScopeStub.restore();
      });

      it('should run without error', async () => {
        const publishStub = sandbox.stub().resolves('wibble');
        queueProcessor.pubSubClient = { topic: sandbox.stub().returns({ publish: publishStub }) };
        const actual = await queueProcessor.handleMessageError(
          {
            id: 9001,
            publishTime: 1549622069481320032,
            data: { foo: 'bar' },
            attributes: { fizz: 'buzz' }
          },
          mockErr
        );
        ((cb as unknown) as (scope: typeof mockScope) => void)(mockScope);

        sinon.assert.calledOnceWithExactly(
          queueProcessor.pubSubClient.topic,
          queueConfig.deadLetterTopic
        );
        sinon.assert.calledOnceWithExactly(publishStub, { foo: 'bar' });
        sinon.assert.calledOnce(withScopeStub);
        sinon.assert.calledOnceWithExactly(mockScope.setContext, 'message', {
          id: 9001,
          deadLetterId: 'wibble',
          publishTime: 1549622069481320032,
          data: `${{ foo: 'bar' }}`,
          attributes: JSON.stringify({ fizz: 'buzz' })
        });
        sinon.assert.calledOnceWithExactly(captureExceptionSpy, mockErr);
        assert.isTrue(actual);
      });

      it('should handle a publishing error', async () => {
        const publishStub = sandbox.stub().rejects('wibble');
        queueProcessor.pubSubClient = { topic: sandbox.stub().returns({ publish: publishStub }) };
        const actual = await queueProcessor.handleMessageError(
          {
            id: 9001,
            publishTime: 1549622069481320032,
            data: { foo: 'bar' },
            attributes: { fizz: 'buzz' }
          },
          mockErr
        );
        ((cb as unknown) as (scope: typeof mockScope) => void)(mockScope);
        assert.property(captureExceptionSpy.args[0][0], 'cause');
        assert.isFalse(actual);
      });
    });

    describe('processBatch', () => {
      beforeEach(() => {
        queueProcessor.pullMessageBatch = sandbox
          .stub()
          .resolves([{ ackId: 1234, data: Buffer.from(JSON.stringify({})) }]);
        queueProcessor.pubSubClient = {
          topic: sinon.stub()
        };
        queueProcessor.subClient = { acknowledge: sandbox.stub().resolves({}) };
      });

      it('should process messages without error', async () => {
        const publishStub = sandbox.stub().resolves({});
        queueProcessor.pubSubClient = {
          topic: sandbox.stub().returns({ publishJSON: publishStub })
        };
        await queueProcessor.processBatch();
        sinon.assert.calledOnce(queueProcessor.pubSubClient.topic);
        sinon.assert.calledOnce(queueProcessor.subClient.acknowledge);
        sinon.assert.calledOnce(publishStub);
        sinon.assert.calledWithExactly(queueProcessor.subClient.acknowledge, {
          subscription: 'projects/default-project/subscriptions/fxa-metrics-raw-events',
          ackIds: [1234]
        });
        sinon.assert.calledWithExactly(publishStub, { message: 'test' });
      });

      it('should not publish filtered messages', async () => {
        queueProcessor.messageProcessor = { processMessage: sandbox.stub().returns(null) };
        await queueProcessor.processBatch();
        sinon.assert.notCalled(queueProcessor.pubSubClient.topic);
        sinon.assert.calledOnce(queueProcessor.subClient.acknowledge);
        sinon.assert.calledWithExactly(queueProcessor.subClient.acknowledge, {
          subscription: 'projects/default-project/subscriptions/fxa-metrics-raw-events',
          ackIds: [1234]
        });
      });

      it('should handle errors processing messages', async () => {
        queueProcessor.messageProcessor = { processMessage: sandbox.stub().throws() };
        queueProcessor.handleMessageError = sinon.stub().resolves(true);
        await queueProcessor.processBatch();
        sinon.assert.notCalled(queueProcessor.pubSubClient.topic);
        sinon.assert.calledOnce(queueProcessor.subClient.acknowledge);
        sinon.assert.calledWithExactly(queueProcessor.subClient.acknowledge, {
          subscription: 'projects/default-project/subscriptions/fxa-metrics-raw-events',
          ackIds: [1234]
        });
      });

      it('should handle errors that fail to publish to dead letter queue', async () => {
        queueProcessor.messageProcessor = { processMessage: sandbox.stub().throws() };
        queueProcessor.handleMessageError = sinon.stub().resolves(false);
        await queueProcessor.processBatch();
        sinon.assert.notCalled(queueProcessor.pubSubClient.topic);
        sinon.assert.calledOnce(queueProcessor.subClient.acknowledge);
        sinon.assert.calledWithExactly(queueProcessor.subClient.acknowledge, {
          subscription: 'projects/default-project/subscriptions/fxa-metrics-raw-events',
          ackIds: []
        });
      });
    });

    describe('start and stop', () => {
      it('works', async () => {
        const emitter = new EventEmitter();
        queueProcessor.processBatch = () => once(emitter, 'next');
        assert.equal(queueProcessor.shouldStop, false);
        // Don't wait for the promise
        queueProcessor.start();

        // Iterate the loop and yield event loop so it runs
        emitter.emit('next');
        await sleep(0);

        // Feed the event loop with one more so it can stop
        emitter.emit('next');
        await queueProcessor.stop();

        assert.equal(queueProcessor.shouldStop, true);
      });
    });
  });
});
