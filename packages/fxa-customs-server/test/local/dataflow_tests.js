/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const { assert } = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const { test: tapTest } = require('tap');

let log;
let config;
let dataflow;
let PubSub;
let pubsub;
let sandbox;
let subscription;

function reset() {
  if (sandbox) {
    sandbox.reset();
  }

  config = {
    dataflow: {
      enabled: true,
      gcpPubSub: {
        projectId: 'foo',
        subscriptionName: 'bar',
      },
    },
  };
}

function test(testName, testFunction) {
  // Convert each test to use an async function to
  // lean on tap's promise handling instead of being
  // forced to call `t.done` in each test.
  return tapTest(testName, async () => {
    reset();
    return await testFunction();
  });
}

test('dataflow', () => {
  sandbox = sinon.createSandbox();

  log = {
    error: sandbox.spy(),
    info: sandbox.spy(),
  };

  subscription = {
    on: sandbox.spy(),
  };

  pubsub = {
    subscription: sandbox.spy(() => subscription),
  };

  PubSub = {
    PubSub: sandbox.spy(function(config) {
      return pubsub;
    }),
  };

  dataflow = proxyquire('../../lib/dataflow', {
    '@google-cloud/pubsub': PubSub,
  });

  test('setup', () => {
    test('DataFlow not enabled causes a no-op', () => {
      config.dataflow.enabled = false;

      dataflow(config, log, async () => ({}));

      assert.isFalse(PubSub.PubSub.called);
    });

    test('missing projectId', () => {
      delete config.dataflow.gcpPubSub.projectId;

      assert.throws(() => dataflow(config, log, async () => {}));
    });

    test('missing subscriptionName', () => {
      delete config.dataflow.gcpPubSub.subscriptionName;

      assert.throws(() => dataflow(config, log, async () => {}));
    });

    test('valid config', () => {
      test('subscription is established to the expected Project ID/Subscription', () => {
        dataflow(config, log, async () => ({}));

        assert.isTrue(PubSub.PubSub.calledOnceWith({ projectId: 'foo' }));
        assert.isTrue(pubsub.subscription.calledOnceWith('bar'));
      });

      test('subscription messages are listened for', () => {
        dataflow(config, log, async () => ({}));

        assert.isTrue(subscription.on.calledTwice);
        assert.strictEqual(subscription.on.args[0][0], 'message');
        assert.isFunction(subscription.on.args[0][1]);

        assert.strictEqual(subscription.on.args[1][0], 'error');
        assert.isFunction(subscription.on.args[1][1]);
      });

      test('subscription errors are logged', () => {
        dataflow(config, log, async () => ({}));

        const errorHandler = subscription.on.args[1][1];
        errorHandler('this is an error');

        assert.deepEqual(log.error.args[0][0], {
          error: 'this is an error',
          op: 'dataflow.subscription.error',
        });
      });
    });
  });

  test('messageHandler', () => {
    test('messages are acked, logged, and processed', () => {
      const { messageHandler } = dataflow(config, log, async () => ({}));

      const messageData = JSON.stringify({
        metadata: [{ key: 'customs_category', value: 'bar' }],
      });
      const message = {
        ack: sinon.spy(),
        id: 'message1',
        data: Buffer.from(messageData),
        attributes: {
          quix: 'quux',
        },
      };

      let processSpy = sinon.spy();
      messageHandler(message, processSpy);

      assert.isTrue(message.ack.calledOnce);

      assert.isTrue(
        log.info.calledOnceWith({
          op: 'dataflow.message',
          count: 0,
          id: 'message1',
          data: messageData,
          attributes: {
            quix: 'quux',
          },
        })
      );

      assert.isTrue(processSpy.calledOnceWith(message));
    });
  });

  test('processMessage', () => {
    test('parse error logs an error', () => {
      const message = {};
      const { processMessage } = dataflow(config, log, async () => ({}));

      const checkMetadata = sinon.spy();
      processMessage(message, () => {
        throw new Error('uh oh');
      });

      assert.strictEqual(log.error.callCount, 1);
      assert.isTrue(
        log.error.calledOnceWith({
          op: 'dataflow.message.invalid',
          reason: 'uh oh',
        })
      );

      assert.isFalse(checkMetadata.called);
    });

    test('properly formed message is checked for unexpected blocks', () => {
      const message = {};
      const { processMessage } = dataflow(config, log, async () => ({}));

      const processBlockEvent = sinon.spy();
      processMessage(message, () => {
        throw new Error('uh oh');
      });

      assert.strictEqual(log.error.callCount, 1);
      assert.isTrue(
        log.error.calledOnceWith({
          op: 'dataflow.message.invalid',
          reason: 'uh oh',
        })
      );

      assert.isFalse(processBlockEvent.called);
    });
  });

  test('parseMessage', () => {
    const { parseMessage } = dataflow(config, log, async () => ({}));

    test('no message throws an error', () => {
      assert.throws(() => parseMessage(), 'missing message');
    });

    test('no data throws an error', () => {
      assert.throws(() => parseMessage({}), 'missing message data');
      assert.throws(() => parseMessage({ foo: 'bar' }), 'missing message data');
    });

    test('invalid data throws an error (must be a Buffer)', () => {
      assert.throws(
        () => parseMessage({ data: 1 }),
        'message data is not a Buffer'
      );
    });

    test('invalid JSON throw an error', () => {
      assert.throws(
        () => parseMessage({ data: Buffer.from('{') }),
        'Unexpected end of JSON input'
      );
    });

    test('missing metadata throws an error', () => {
      assert.throws(() =>
        parseMessage({ data: Buffer.from(JSON.stringify({})) })
      );
    });

    test('invalid metadata throws an error', () => {
      assert.throws(() =>
        parseMessage({ data: Buffer.from(JSON.stringify({ metadata: 1 })) })
      );
    });

    test('missing entry key throws an error', () => {
      assert.throws(
        () =>
          parseMessage({
            data: Buffer.from(
              JSON.stringify({
                metadata: [{ value: 'bar' }],
              })
            ),
          }),
        'missing metadata key'
      );
    });

    test('missing entry value throws an error', () => {
      assert.throws(
        () =>
          parseMessage({
            data: Buffer.from(
              JSON.stringify({
                metadata: [{ key: 'bar' }],
              })
            ),
          }),
        'missing metadata value'
      );
    });

    test('valid message returns metadata array converted to an object', () => {
      assert.deepEqual(
        parseMessage({
          data: Buffer.from(
            JSON.stringify({
              metadata: [
                {
                  key: 'foo',
                  value: 'bar',
                },
                {
                  key: 'biz',
                  value: 'buz',
                },
              ],
            })
          ),
        }),
        {
          biz: 'buz',
          foo: 'bar',
        }
      );
    });
  });

  test('checkForUnexpectedBlock', () => {
    let fetchSpy;

    const { checkForUnexpectedBlock } = dataflow(config, log, (...args) =>
      fetchSpy(...args)
    );

    test('missing customs_category logs an error', () => {
      fetchSpy = sinon.spy();

      checkForUnexpectedBlock({
        accountid: 'testuser@testusre.com',
        sourceaddress: '127.0.0.1',
      });

      assert.isTrue(log.error.calledOnce);
      assert.isTrue(
        log.error.calledOnceWith({
          op: 'dataflow.customs_category.missing',
        })
      );

      assert.isFalse(fetchSpy.called);
    });

    test('unknown category logs an error', () => {
      fetchSpy = sinon.spy();

      checkForUnexpectedBlock({
        customs_category: 'category',
        accountid: 'testuser@testusre.com',
        sourceaddress: '127.0.0.1',
      });

      assert.isTrue(log.error.calledOnce);
      assert.isTrue(
        log.error.calledOnceWith({
          op: 'dataflow.customs_category.unknown',
          customs_category: 'category',
        })
      );

      assert.isFalse(fetchSpy.called);
    });

    test('rl_login_failure_sourceaddress_accountid', () => {
      test('no ipEmailRecord logs an unexpected block', async () => {
        fetchSpy = sinon.spy(() => ({}));

        await checkForUnexpectedBlock({
          customs_category: 'rl_login_failure_sourceaddress_accountid',
          accountid: 'foo',
          sourceaddress: 'bar',
        });

        assert.isTrue(
          fetchSpy.calledOnceWith({
            email: 'foo',
            ip: 'bar',
          })
        );

        assert.equal(log.info.callCount, 1);
        assert.isTrue(
          log.info.calledOnceWith({
            accountid: 'foo',
            customs_category: 'rl_login_failure_sourceaddress_accountid',
            op: 'dataflow.block.unexpected',
            sourceaddress: 'bar',
          })
        );
      });

      test('ipEmailRecord is not blocked logs an unexpected block', async () => {
        const records = {
          ipEmailRecord: {
            shouldBlock: sinon.spy(() => false),
          },
        };

        fetchSpy = sinon.spy(() => records);

        await checkForUnexpectedBlock({
          customs_category: 'rl_login_failure_sourceaddress_accountid',
          accountid: 'foo',
          sourceaddress: 'bar',
        });

        assert.isTrue(
          fetchSpy.calledOnceWith({
            email: 'foo',
            ip: 'bar',
          })
        );

        assert.isTrue(records.ipEmailRecord.shouldBlock.calledOnce);

        assert.equal(log.info.callCount, 1);
        assert.isTrue(
          log.info.calledOnceWith({
            accountid: 'foo',
            customs_category: 'rl_login_failure_sourceaddress_accountid',
            op: 'dataflow.block.unexpected',
            sourceaddress: 'bar',
          })
        );
      });

      test('ipEmailRecord is blocked logs an expected block', async () => {
        const records = {
          ipEmailRecord: {
            shouldBlock: sinon.spy(() => true),
          },
        };

        fetchSpy = sinon.spy(() => records);

        await checkForUnexpectedBlock({
          customs_category: 'rl_login_failure_sourceaddress_accountid',
          accountid: 'foo',
          sourceaddress: 'bar',
        });

        assert.isTrue(
          fetchSpy.calledOnceWith({
            email: 'foo',
            ip: 'bar',
          })
        );

        assert.isTrue(records.ipEmailRecord.shouldBlock.calledOnce);

        assert.isTrue(
          log.info.calledOnceWith({
            accountid: 'foo',
            customs_category: 'rl_login_failure_sourceaddress_accountid',
            op: 'dataflow.block.expected',
            sourceaddress: 'bar',
          })
        );
      });
    });

    test('rl_sms_sourceaddress', () => {
      test('no ipRecord logs an unexpected block', async () => {
        fetchSpy = sinon.spy(() => ({}));

        await checkForUnexpectedBlock({
          customs_category: 'rl_sms_sourceaddress',
          sourceaddress: 'bar',
        });

        assert.isTrue(
          fetchSpy.calledOnceWith({
            ip: 'bar',
          })
        );

        assert.equal(log.info.callCount, 1);
        assert.isTrue(
          log.info.calledOnceWith({
            customs_category: 'rl_sms_sourceaddress',
            op: 'dataflow.block.unexpected',
            sourceaddress: 'bar',
          })
        );
      });

      test('ipRecord is not blocked logs an unexpected block', async () => {
        const records = {
          ipRecord: {
            shouldBlock: sinon.spy(() => false),
          },
        };

        fetchSpy = sinon.spy(() => records);

        await checkForUnexpectedBlock({
          customs_category: 'rl_sms_sourceaddress',
          sourceaddress: 'bar',
        });

        assert.isTrue(
          fetchSpy.calledOnceWith({
            ip: 'bar',
          })
        );

        assert.isTrue(records.ipRecord.shouldBlock.calledOnce);

        assert.equal(log.info.callCount, 1);
        assert.isTrue(
          log.info.calledOnceWith({
            customs_category: 'rl_sms_sourceaddress',
            op: 'dataflow.block.unexpected',
            sourceaddress: 'bar',
          })
        );
      });

      test('ipRecord is blocked logs an expected block', async () => {
        const records = {
          ipRecord: {
            shouldBlock: sinon.spy(() => true),
          },
        };

        fetchSpy = sinon.spy(() => records);

        await checkForUnexpectedBlock({
          customs_category: 'rl_sms_sourceaddress',
          sourceaddress: 'bar',
        });

        assert.isTrue(
          fetchSpy.calledOnceWith({
            ip: 'bar',
          })
        );

        assert.isTrue(records.ipRecord.shouldBlock.calledOnce);

        assert.isTrue(
          log.info.calledOnceWith({
            customs_category: 'rl_sms_sourceaddress',
            op: 'dataflow.block.expected',
            sourceaddress: 'bar',
          })
        );
      });
    });

    test('rl_sms_accountid', () => {
      test('no emailRecord logs an unexpected block', async () => {
        fetchSpy = sinon.spy(() => ({}));

        await checkForUnexpectedBlock({
          customs_category: 'rl_sms_accountid',
          accountid: 'foo',
        });

        assert.isTrue(
          fetchSpy.calledOnceWith({
            email: 'foo',
          })
        );

        assert.equal(log.info.callCount, 1);
        assert.isTrue(
          log.info.calledOnceWith({
            accountid: 'foo',
            customs_category: 'rl_sms_accountid',
            op: 'dataflow.block.unexpected',
          })
        );
      });

      test('emailRecord is not blocked logs an unexpected block', async () => {
        const records = {
          emailRecord: {
            shouldBlock: sinon.spy(() => false),
          },
        };

        fetchSpy = sinon.spy(() => records);

        await checkForUnexpectedBlock({
          customs_category: 'rl_sms_accountid',
          accountid: 'foo',
        });

        assert.isTrue(
          fetchSpy.calledOnceWith({
            email: 'foo',
          })
        );

        assert.isTrue(records.emailRecord.shouldBlock.calledOnce);

        assert.equal(log.info.callCount, 1);
        assert.isTrue(
          log.info.calledOnceWith({
            accountid: 'foo',
            customs_category: 'rl_sms_accountid',
            op: 'dataflow.block.unexpected',
          })
        );
      });

      test('emailRecord is blocked logs an expected block', async () => {
        const records = {
          emailRecord: {
            shouldBlock: sinon.spy(() => true),
          },
        };

        fetchSpy = sinon.spy(() => records);

        await checkForUnexpectedBlock({
          customs_category: 'rl_sms_accountid',
          accountid: 'foo',
        });

        assert.isTrue(
          fetchSpy.calledOnceWith({
            email: 'foo',
          })
        );

        assert.isTrue(records.emailRecord.shouldBlock.calledOnce);

        assert.isTrue(
          log.info.calledOnceWith({
            accountid: 'foo',
            customs_category: 'rl_sms_accountid',
            op: 'dataflow.block.expected',
          })
        );
      });
    });

    test('rl_email_recipient', () => {
      test('no emailRecord logs an unexpected block', async () => {
        fetchSpy = sinon.spy(() => ({}));

        await checkForUnexpectedBlock({
          customs_category: 'rl_email_recipient',
          accountid: 'foo',
        });

        assert.isTrue(
          fetchSpy.calledOnceWith({
            email: 'foo',
          })
        );

        assert.equal(log.info.callCount, 1);
        assert.isTrue(
          log.info.calledOnceWith({
            accountid: 'foo',
            customs_category: 'rl_email_recipient',
            op: 'dataflow.block.unexpected',
          })
        );
      });

      test('emailRecord is not blocked logs an unexpected block', async () => {
        const records = {
          emailRecord: {
            shouldBlock: sinon.spy(() => false),
          },
        };

        fetchSpy = sinon.spy(() => records);

        await checkForUnexpectedBlock({
          customs_category: 'rl_email_recipient',
          accountid: 'foo',
        });

        assert.isTrue(
          fetchSpy.calledOnceWith({
            email: 'foo',
          })
        );

        assert.isTrue(records.emailRecord.shouldBlock.calledOnce);

        assert.equal(log.info.callCount, 1);
        assert.isTrue(
          log.info.calledOnceWith({
            accountid: 'foo',
            customs_category: 'rl_email_recipient',
            op: 'dataflow.block.unexpected',
          })
        );
      });

      test('emailRecord is blocked logs an expected block', async () => {
        const records = {
          emailRecord: {
            shouldBlock: sinon.spy(() => true),
          },
        };

        fetchSpy = sinon.spy(() => records);

        await checkForUnexpectedBlock({
          customs_category: 'rl_email_recipient',
          accountid: 'foo',
        });

        assert.isTrue(
          fetchSpy.calledOnceWith({
            email: 'foo',
          })
        );

        assert.isTrue(records.emailRecord.shouldBlock.calledOnce);

        assert.isTrue(
          log.info.calledOnceWith({
            accountid: 'foo',
            customs_category: 'rl_email_recipient',
            op: 'dataflow.block.expected',
          })
        );
      });
    });

    test('rl_statuscheck', () => {
      test('no ipRecord logs an unexpected block', async () => {
        fetchSpy = sinon.spy(() => ({}));

        await checkForUnexpectedBlock({
          customs_category: 'rl_statuscheck',
          sourceaddress: 'bar',
        });

        assert.isTrue(
          fetchSpy.calledOnceWith({
            ip: 'bar',
          })
        );

        assert.equal(log.info.callCount, 1);
        assert.isTrue(
          log.info.calledOnceWith({
            customs_category: 'rl_statuscheck',
            op: 'dataflow.block.unexpected',
            sourceaddress: 'bar',
          })
        );
      });

      test('ipRecord is not blocked logs an unexpected block', async () => {
        const records = {
          ipRecord: {
            shouldBlock: sinon.spy(() => false),
          },
        };

        fetchSpy = sinon.spy(() => records);

        await checkForUnexpectedBlock({
          customs_category: 'rl_statuscheck',
          sourceaddress: 'bar',
        });

        assert.isTrue(
          fetchSpy.calledOnceWith({
            ip: 'bar',
          })
        );

        assert.isTrue(records.ipRecord.shouldBlock.calledOnce);

        assert.equal(log.info.callCount, 1);
        assert.isTrue(
          log.info.calledOnceWith({
            customs_category: 'rl_statuscheck',
            op: 'dataflow.block.unexpected',
            sourceaddress: 'bar',
          })
        );
      });

      test('ipRecord is blocked logs an expected block', async () => {
        const records = {
          ipRecord: {
            shouldBlock: sinon.spy(() => true),
          },
        };

        fetchSpy = sinon.spy(() => records);

        await checkForUnexpectedBlock({
          customs_category: 'rl_statuscheck',
          sourceaddress: 'bar',
        });

        assert.isTrue(
          fetchSpy.calledOnceWith({
            ip: 'bar',
          })
        );

        assert.isTrue(records.ipRecord.shouldBlock.calledOnce);

        assert.isTrue(
          log.info.calledOnceWith({
            customs_category: 'rl_statuscheck',
            op: 'dataflow.block.expected',
            sourceaddress: 'bar',
          })
        );
      });
    });

    test('rl_verifycode_sourceaddress_accountid', () => {
      test('no uidRecord logs an unexpected block', async () => {
        fetchSpy = sinon.spy(() => ({}));

        await checkForUnexpectedBlock({
          customs_category: 'rl_verifycode_sourceaddress_accountid',
          sourceaddress: 'bar',
          uid: 'buz',
        });

        assert.isTrue(
          fetchSpy.calledOnceWith({
            uid: 'buz',
          })
        );

        assert.equal(log.info.callCount, 1);
        assert.isTrue(
          log.info.calledOnceWith({
            customs_category: 'rl_verifycode_sourceaddress_accountid',
            op: 'dataflow.block.unexpected',
            sourceaddress: 'bar',
            uid: 'buz',
          })
        );
      });

      test('uidRecord is not blocked logs an unexpected block', async () => {
        const records = {
          uidRecord: {
            isRateLimited: sinon.spy(() => false),
          },
        };

        fetchSpy = sinon.spy(() => records);

        await checkForUnexpectedBlock({
          customs_category: 'rl_verifycode_sourceaddress_accountid',
          sourceaddress: 'bar',
          uid: 'buz',
        });

        assert.isTrue(
          fetchSpy.calledOnceWith({
            uid: 'buz',
          })
        );

        assert.isTrue(records.uidRecord.isRateLimited.calledOnce);

        assert.equal(log.info.callCount, 1);
        assert.isTrue(
          log.info.calledOnceWith({
            customs_category: 'rl_verifycode_sourceaddress_accountid',
            op: 'dataflow.block.unexpected',
            sourceaddress: 'bar',
            uid: 'buz',
          })
        );
      });

      test('uidRecord is blocked logs an expected block', async () => {
        const records = {
          uidRecord: {
            isRateLimited: sinon.spy(() => true),
          },
        };

        fetchSpy = sinon.spy(() => records);

        await checkForUnexpectedBlock({
          customs_category: 'rl_verifycode_sourceaddress_accountid',
          sourceaddress: 'bar',
          uid: 'buz',
        });

        assert.isTrue(
          fetchSpy.calledOnceWith({
            uid: 'buz',
          })
        );

        assert.isTrue(records.uidRecord.isRateLimited.calledOnce);

        assert.isTrue(
          log.info.calledOnceWith({
            customs_category: 'rl_verifycode_sourceaddress_accountid',
            op: 'dataflow.block.expected',
            sourceaddress: 'bar',
            uid: 'buz',
          })
        );
      });
    });
  });
});
