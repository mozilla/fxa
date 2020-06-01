/* eslint-disable camelcase */
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const { assert } = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const { test: tapTest } = require('tap');

tapTest('dataflow', async () => {
  const sandbox = sinon.createSandbox();
  const config = {
    dataflow: {
      enabled: true,
      reportOnly: false,
      ignoreOlderThan: 1000,
      gcpPubSub: {
        projectId: 'foo',
        subscriptionName: 'bar',
      },
    },
  };
  const log = {
    error: sandbox.spy(),
    info: sandbox.spy(),
    warn: sandbox.spy(),
  };
  const records = {
    emailRecord: {
      suspect: sandbox.spy(),
      block: sandbox.spy(),
      disable: sandbox.spy(),
    },
    ipRecord: {
      suspect: sandbox.spy(),
      block: sandbox.spy(),
      disable: sandbox.spy(),
    },
  };
  const fetchRecords = sandbox.spy(async () => records);
  const setRecords = sandbox.spy(async () => {});
  const subscription = {
    on: sandbox.spy(),
  };
  const pubsub = {
    subscription: sandbox.spy(() => subscription),
  };
  const PubSub = sandbox.spy(function () {
    return pubsub;
  });
  const dataflow = proxyquire('../../lib/dataflow', {
    '@google-cloud/pubsub': { PubSub },
  });
  const data = {
    timestamp: new Date().toISOString(),
    id: 'wibble',
    indicator_type: 'email',
    indicator: 'pb@example.com',
    severity: 'warn',
    confidence: 42,
    heuristic: 'heurizzle',
    heuristic_description: 'this is a heuristic',
    reason: 'because',
    suggested_action: 'suspect',
    details: {
      key: 'value',
    },
  };

  test('dataflow disabled', () => {
    config.dataflow.enabled = false;

    dataflow(config, log, fetchRecords, setRecords);

    assert.equal(PubSub.callCount, 0);
  });

  test('missing gcp projectId', () => {
    config.dataflow.enabled = true;
    config.dataflow.gcpPubSub.projectId = null;

    assert.throws(() => dataflow(config, log, fetchRecords, setRecords));
  });

  test('missing gcp subscriptionName', () => {
    config.dataflow.gcpPubSub.projectId = 'foo';
    config.dataflow.gcpPubSub.subscriptionName = null;

    assert.throws(() => dataflow(config, log, fetchRecords, setRecords));
  });

  test('default config', () => {
    config.dataflow.gcpPubSub.subscriptionName = 'bar';

    dataflow(config, log, fetchRecords, setRecords);

    assert.equal(PubSub.callCount, 1);
    let args = PubSub.args[0];
    assert.lengthOf(args, 1);
    assert.deepEqual(args[0], { projectId: 'foo' });

    assert.equal(pubsub.subscription.callCount, 1);
    args = pubsub.subscription.args[0];
    assert.lengthOf(args, 1);
    assert.equal(args[0], 'bar');

    assert.equal(subscription.on.callCount, 2);
    args = subscription.on.args[0];
    assert.lengthOf(args, 2);
    assert.equal(args[0], 'message');
    const messageHandler = args[1];
    assert.isFunction(messageHandler);
    assert.lengthOf(messageHandler, 1);

    args = subscription.on.args[1];
    assert.lengthOf(args, 2);
    assert.equal(args[0], 'error');
    const errorHandler = args[1];
    assert.isFunction(errorHandler);
    assert.lengthOf(errorHandler, 1);
    assert.notEqual(errorHandler, messageHandler);

    assert.equal(log.error.callCount, 0);
    assert.equal(log.info.callCount, 0);
    assert.equal(log.warn.callCount, 0);
    assert.equal(fetchRecords.callCount, 0);
    assert.equal(setRecords.callCount, 0);

    test('invalid data', async () => {
      const message = {
        ack: sandbox.spy(),
        nack: sandbox.spy(),
        id: 'blee',
        data: { ...data },
        publishTime: data.timestamp,
      };
      await messageHandler(message);

      assert.equal(log.error.callCount, 1);
      args = log.error.args[0];
      assert.lengthOf(args, 1);
      assert.deepEqual(args[0], {
        op: 'dataflow.message.error',
        id: 'blee',
        data,
        error: 'invalid message',
        publishTime: data.timestamp,
      });

      assert.equal(message.nack.callCount, 1);
      assert.lengthOf(message.nack.args[0], 0);

      assert.equal(message.ack.callCount, 0);
      assert.equal(log.info.callCount, 0);
      assert.equal(log.warn.callCount, 0);
      assert.equal(fetchRecords.callCount, 0);
      assert.equal(setRecords.callCount, 0);
    });

    test('invalid data, old message', async () => {
      const publishTime = new Date(Date.now() - 1001).toISOString();
      const message = {
        ack: sandbox.spy(),
        nack: sandbox.spy(),
        id: 'blee',
        data: { ...data },
        publishTime,
      };
      await messageHandler(message);

      assert.equal(log.error.callCount, 1);
      args = log.error.args[0];
      assert.lengthOf(args, 1);
      assert.deepEqual(args[0], {
        op: 'dataflow.message.error-old',
        id: 'blee',
        data,
        error: 'invalid message',
        publishTime,
      });

      assert.equal(message.ack.callCount, 1);
      assert.lengthOf(message.ack.args[0], 0);

      assert.equal(message.nack.callCount, 0);
      assert.equal(log.info.callCount, 0);
      assert.equal(log.warn.callCount, 0);
      assert.equal(fetchRecords.callCount, 0);
      assert.equal(setRecords.callCount, 0);
    });

    test('invalid suggested_action', async () => {
      const message = {
        ack: sandbox.spy(),
        nack: sandbox.spy(),
        id: 'blee',
        data: Buffer.from(
          JSON.stringify({
            ...data,
            suggested_action: 'ban',
          })
        ),
        publishTime: data.timestamp,
      };
      await messageHandler(message);

      assert.equal(log.error.callCount, 1);
      assert.deepEqual(log.error.args[0][0], {
        op: 'dataflow.message.error',
        id: 'blee',
        data: message.data,
        error: 'invalid suggested_action: ban',
        publishTime: data.timestamp,
      });

      assert.equal(message.nack.callCount, 1);

      assert.equal(message.ack.callCount, 0);
      assert.equal(log.info.callCount, 0);
      assert.equal(log.warn.callCount, 0);
      assert.equal(fetchRecords.callCount, 0);
      assert.equal(setRecords.callCount, 0);
    });

    test('invalid indicator_type', async () => {
      const message = {
        ack: sandbox.spy(),
        nack: sandbox.spy(),
        id: 'blee',
        data: Buffer.from(
          JSON.stringify({
            ...data,
            indicator_type: 'ip',
            indicator: '1.1.1.1',
          })
        ),
        publishTime: data.timestamp,
      };
      await messageHandler(message);

      assert.equal(log.error.callCount, 1);
      assert.equal(log.error.args[0][0].error, 'invalid indicator_type: ip');

      assert.equal(message.nack.callCount, 1);

      assert.equal(message.ack.callCount, 0);
      assert.equal(log.info.callCount, 0);
      assert.equal(log.warn.callCount, 0);
      assert.equal(fetchRecords.callCount, 0);
      assert.equal(setRecords.callCount, 0);
    });

    test('invalid indicator', async () => {
      const message = {
        ack: sandbox.spy(),
        nack: sandbox.spy(),
        id: 'blee',
        data: Buffer.from(
          JSON.stringify({
            ...data,
            indicator: {},
          })
        ),
        publishTime: data.timestamp,
      };
      await messageHandler(message);

      assert.equal(log.error.callCount, 1);
      assert.equal(log.error.args[0][0].error, 'invalid indicator: object');

      assert.equal(message.nack.callCount, 1);

      assert.equal(message.ack.callCount, 0);
      assert.equal(log.info.callCount, 0);
      assert.equal(log.warn.callCount, 0);
      assert.equal(fetchRecords.callCount, 0);
      assert.equal(setRecords.callCount, 0);
    });

    test('empty indicator', async () => {
      const message = {
        ack: sandbox.spy(),
        nack: sandbox.spy(),
        id: 'blee',
        data: Buffer.from(
          JSON.stringify({
            ...data,
            indicator: '',
          })
        ),
        publishTime: data.timestamp,
      };
      await messageHandler(message);

      assert.equal(log.error.callCount, 1);
      assert.equal(log.error.args[0][0].error, 'invalid indicator: string');

      assert.equal(message.nack.callCount, 1);

      assert.equal(message.ack.callCount, 0);
      assert.equal(log.info.callCount, 0);
      assert.equal(log.warn.callCount, 0);
      assert.equal(fetchRecords.callCount, 0);
      assert.equal(setRecords.callCount, 0);
    });

    test('old message', async () => {
      const timestamp = new Date(Date.now() - 1001).toISOString();
      const message = {
        ack: sandbox.spy(),
        nack: sandbox.spy(),
        id: 'blee',
        data: Buffer.from(
          JSON.stringify({
            ...data,
            timestamp,
          })
        ),
      };
      await messageHandler(message);

      assert.equal(log.warn.callCount, 1);
      args = log.warn.args[0];
      assert.lengthOf(args, 1);
      assert.deepEqual(args[0], {
        op: 'dataflow.message.ignore',
        id: 'blee',
        timestamp,
        email: 'pb@example.com',
        severity: 'warn',
        confidence: 42,
        heuristic: 'heurizzle',
        heuristic_description: 'this is a heuristic',
        reason: 'because',
        suggested_action: 'suspect',
        reportOnly: false,
      });

      assert.equal(message.ack.callCount, 1);

      assert.equal(message.nack.callCount, 0);
      assert.equal(log.info.callCount, 0);
      assert.equal(log.error.callCount, 0);
      assert.equal(fetchRecords.callCount, 0);
      assert.equal(setRecords.callCount, 0);
    });

    test('report email', async () => {
      const message = {
        ack: sandbox.spy(),
        nack: sandbox.spy(),
        id: 'blee',
        data: Buffer.from(
          JSON.stringify({
            ...data,
            suggested_action: 'report',
          })
        ),
      };
      await messageHandler(message);

      assert.equal(log.info.callCount, 1);
      args = log.info.args[0];
      assert.lengthOf(args, 1);
      assert.deepEqual(args[0], {
        op: 'dataflow.message.report',
        id: 'blee',
        timestamp: data.timestamp,
        email: 'pb@example.com',
        severity: 'warn',
        confidence: 42,
        heuristic: 'heurizzle',
        heuristic_description: 'this is a heuristic',
        reason: 'because',
        suggested_action: 'report',
        reportOnly: false,
      });

      assert.equal(message.ack.callCount, 1);
      assert.lengthOf(message.ack.args[0], 0);

      assert.equal(message.nack.callCount, 0);
      assert.equal(log.warn.callCount, 0);
      assert.equal(log.error.callCount, 0);
      assert.equal(fetchRecords.callCount, 0);
      assert.equal(setRecords.callCount, 0);
    });

    test('report sourceaddress', async () => {
      const message = {
        ack: sandbox.spy(),
        nack: sandbox.spy(),
        id: 'blee',
        data: Buffer.from(
          JSON.stringify({
            ...data,
            suggested_action: 'report',
            indicator_type: 'sourceaddress',
            indicator: '1.1.1.1',
          })
        ),
      };
      await messageHandler(message);

      assert.equal(log.info.callCount, 1);
      args = log.info.args[0];
      assert.equal(args[0].ip, '1.1.1.1');
      assert.isUndefined(args[0].email);

      assert.equal(message.ack.callCount, 1);

      assert.equal(message.nack.callCount, 0);
      assert.equal(log.warn.callCount, 0);
      assert.equal(log.error.callCount, 0);
      assert.equal(fetchRecords.callCount, 0);
      assert.equal(setRecords.callCount, 0);
    });

    test('suspect email', async () => {
      const message = {
        ack: sandbox.spy(),
        nack: sandbox.spy(),
        id: 'blee',
        data: Buffer.from(JSON.stringify(data)),
      };
      await messageHandler(message);

      assert.equal(fetchRecords.callCount, 1);
      args = fetchRecords.args[0];
      assert.lengthOf(args, 1);
      assert.deepEqual(args[0], {
        email: 'pb@example.com',
      });

      assert.equal(records.emailRecord.suspect.callCount, 1);
      assert.lengthOf(records.emailRecord.suspect.args[0], 0);

      assert.equal(setRecords.callCount, 1);
      args = setRecords.args[0];
      assert.lengthOf(args, 1);
      assert.equal(args[0], records);
      assert.isTrue(setRecords.calledAfter(records.emailRecord.suspect));

      assert.equal(message.ack.callCount, 1);

      assert.equal(log.info.callCount, 1);
      args = log.info.args[0];
      assert.lengthOf(args, 1);
      assert.deepEqual(args[0], {
        op: 'dataflow.message.success',
        id: 'blee',
        timestamp: data.timestamp,
        email: 'pb@example.com',
        severity: 'warn',
        confidence: 42,
        heuristic: 'heurizzle',
        heuristic_description: 'this is a heuristic',
        reason: 'because',
        suggested_action: 'suspect',
        reportOnly: false,
      });

      assert.equal(message.nack.callCount, 0);
      assert.equal(log.warn.callCount, 0);
      assert.equal(log.error.callCount, 0);
      assert.equal(records.emailRecord.block.callCount, 0);
      assert.equal(records.emailRecord.disable.callCount, 0);
      assert.equal(records.ipRecord.suspect.callCount, 0);
      assert.equal(records.ipRecord.block.callCount, 0);
      assert.equal(records.ipRecord.disable.callCount, 0);
    });

    test('suspect sourceaddress', async () => {
      const message = {
        ack: sandbox.spy(),
        nack: sandbox.spy(),
        id: 'blee',
        data: Buffer.from(
          JSON.stringify({
            ...data,
            indicator_type: 'sourceaddress',
            indicator: '1.1.1.1',
          })
        ),
      };
      await messageHandler(message);

      assert.equal(fetchRecords.callCount, 1);
      assert.deepEqual(fetchRecords.args[0][0], {
        ip: '1.1.1.1',
      });

      assert.equal(records.ipRecord.suspect.callCount, 1);
      assert.lengthOf(records.ipRecord.suspect.args[0], 0);

      assert.equal(setRecords.callCount, 1);
      assert.equal(setRecords.args[0][0], records);
      assert.isTrue(setRecords.calledAfter(records.ipRecord.suspect));

      assert.equal(message.ack.callCount, 1);

      assert.equal(log.info.callCount, 1);
      assert.equal(log.info.args[0][0].ip, '1.1.1.1');

      assert.equal(message.nack.callCount, 0);
      assert.equal(log.warn.callCount, 0);
      assert.equal(log.error.callCount, 0);
      assert.equal(records.emailRecord.suspect.callCount, 0);
      assert.equal(records.emailRecord.block.callCount, 0);
      assert.equal(records.emailRecord.disable.callCount, 0);
      assert.equal(records.ipRecord.block.callCount, 0);
      assert.equal(records.ipRecord.disable.callCount, 0);
    });

    test('block', async () => {
      const message = {
        ack: sandbox.spy(),
        nack: sandbox.spy(),
        id: 'blee',
        data: Buffer.from(
          JSON.stringify({
            ...data,
            suggested_action: 'block',
          })
        ),
      };
      await messageHandler(message);

      assert.equal(fetchRecords.callCount, 1);

      assert.equal(records.emailRecord.block.callCount, 1);
      assert.lengthOf(records.emailRecord.block.args[0], 0);

      assert.equal(setRecords.callCount, 1);
      assert.equal(setRecords.args[0][0], records);
      assert.isTrue(setRecords.calledAfter(records.emailRecord.block));

      assert.equal(message.ack.callCount, 1);

      assert.equal(log.info.callCount, 1);
      assert.equal(log.info.args[0][0].op, 'dataflow.message.success');

      assert.equal(message.nack.callCount, 0);
      assert.equal(log.warn.callCount, 0);
      assert.equal(log.error.callCount, 0);
      assert.equal(records.emailRecord.suspect.callCount, 0);
      assert.equal(records.emailRecord.disable.callCount, 0);
      assert.equal(records.ipRecord.suspect.callCount, 0);
      assert.equal(records.ipRecord.block.callCount, 0);
      assert.equal(records.ipRecord.disable.callCount, 0);
    });

    test('disable', async () => {
      const message = {
        ack: sandbox.spy(),
        nack: sandbox.spy(),
        id: 'blee',
        data: Buffer.from(
          JSON.stringify({
            ...data,
            suggested_action: 'disable',
          })
        ),
      };
      await messageHandler(message);

      assert.equal(fetchRecords.callCount, 1);

      assert.equal(records.emailRecord.disable.callCount, 1);
      assert.lengthOf(records.emailRecord.disable.args[0], 0);

      assert.equal(setRecords.callCount, 1);
      assert.equal(setRecords.args[0][0], records);
      assert.isTrue(setRecords.calledAfter(records.emailRecord.disable));

      assert.equal(message.ack.callCount, 1);

      assert.equal(log.info.callCount, 1);
      assert.equal(log.info.args[0][0].op, 'dataflow.message.success');

      assert.equal(message.nack.callCount, 0);
      assert.equal(log.warn.callCount, 0);
      assert.equal(log.error.callCount, 0);
      assert.equal(records.emailRecord.suspect.callCount, 0);
      assert.equal(records.emailRecord.block.callCount, 0);
      assert.equal(records.ipRecord.suspect.callCount, 0);
      assert.equal(records.ipRecord.block.callCount, 0);
      assert.equal(records.ipRecord.disable.callCount, 0);
    });

    test('error handler', () => {
      errorHandler(new TypeError('something failed'));

      assert.equal(log.error.callCount, 1);
      args = log.error.args[0];
      assert.lengthOf(args, 1);
      assert.deepEqual(args[0], {
        op: 'dataflow.subscription.error',
        error: 'TypeError: something failed',
      });

      assert.equal(log.info.callCount, 0);
      assert.equal(log.warn.callCount, 0);
      assert.equal(fetchRecords.callCount, 0);
      assert.equal(setRecords.callCount, 0);
    });
  });

  test('config.reportOnly', () => {
    config.dataflow.reportOnly = true;

    dataflow(config, log, fetchRecords, setRecords);

    assert.equal(PubSub.callCount, 1);
    assert.equal(pubsub.subscription.callCount, 1);

    assert.equal(subscription.on.callCount, 2);
    const args = subscription.on.args[0];
    assert.equal(args[0], 'message');
    const messageHandler = args[1];
    assert.isFunction(messageHandler);

    assert.equal(log.error.callCount, 0);
    assert.equal(log.info.callCount, 0);
    assert.equal(log.warn.callCount, 0);
    assert.equal(fetchRecords.callCount, 0);
    assert.equal(setRecords.callCount, 0);

    test('suspect', async () => {
      const message = {
        ack: sandbox.spy(),
        nack: sandbox.spy(),
        id: 'blee',
        data: Buffer.from(JSON.stringify(data)),
      };
      await messageHandler(message);

      assert.equal(log.info.callCount, 1);
      assert.deepEqual(log.info.args[0][0], {
        op: 'dataflow.message.report',
        id: 'blee',
        timestamp: data.timestamp,
        email: 'pb@example.com',
        severity: 'warn',
        confidence: 42,
        heuristic: 'heurizzle',
        heuristic_description: 'this is a heuristic',
        reason: 'because',
        suggested_action: 'suspect',
        reportOnly: true,
      });

      assert.equal(message.ack.callCount, 1);

      assert.equal(message.nack.callCount, 0);
      assert.equal(log.warn.callCount, 0);
      assert.equal(log.error.callCount, 0);
      assert.equal(fetchRecords.callCount, 0);
      assert.equal(setRecords.callCount, 0);
    });

    test('block', async () => {
      const message = {
        ack: sandbox.spy(),
        nack: sandbox.spy(),
        id: 'blee',
        data: Buffer.from(
          JSON.stringify({
            ...data,
            suggested_action: 'block',
          })
        ),
      };
      await messageHandler(message);

      assert.equal(log.info.callCount, 1);
      assert.deepEqual(log.info.args[0][0].suggested_action, 'block');

      assert.equal(message.ack.callCount, 1);

      assert.equal(message.nack.callCount, 0);
      assert.equal(log.warn.callCount, 0);
      assert.equal(log.error.callCount, 0);
      assert.equal(fetchRecords.callCount, 0);
      assert.equal(setRecords.callCount, 0);
    });

    test('disable', async () => {
      const message = {
        ack: sandbox.spy(),
        nack: sandbox.spy(),
        id: 'blee',
        data: Buffer.from(
          JSON.stringify({
            ...data,
            suggested_action: 'disable',
          })
        ),
      };
      await messageHandler(message);

      assert.equal(log.info.callCount, 1);
      assert.deepEqual(log.info.args[0][0].suggested_action, 'disable');

      assert.equal(message.ack.callCount, 1);

      assert.equal(message.nack.callCount, 0);
      assert.equal(log.warn.callCount, 0);
      assert.equal(log.error.callCount, 0);
      assert.equal(fetchRecords.callCount, 0);
      assert.equal(setRecords.callCount, 0);
    });
  });

  function test(name, callback) {
    // Wrap tap so that sandbox is reset automatically and return
    // a promise so we don't have to call t.end() like a chump.
    tapTest(name, async () => {
      sandbox.reset();
      await callback();
    });
  }
});
