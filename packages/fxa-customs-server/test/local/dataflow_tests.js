/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const proxyquire = require('proxyquire')
const sinon = require('sinon')
const { test } = require('tap')

let log
let config
let dataflow
let PubSub
let pubsub
let subscription

test(
  'shared setup', async (t) => {
    log =  {
      error: sinon.spy(),
      info: sinon.spy()
    }

    subscription = {
      on: sinon.spy()
    }

    pubsub = {
      subscription: sinon.spy(() => subscription)
    }

    PubSub = {
      PubSub: sinon.spy(function (config) {
        return pubsub
      })
    }

    dataflow = proxyquire('../../lib/dataflow', {
      '@google-cloud/pubsub': PubSub
    })
  }
)

test(
  'setup not enabled causes a no-op', async (t) => {
    config = {
      dataflow: {
        enabled: false,
        gcpPubSub: {
          projectId: 'foo',
          subscriptionName: 'bar'
        }
      }
    }

    dataflow(config, log)

    t.equal(PubSub.PubSub.called, false)
  }
)

test(
  'setup missing projectId', async (t) => {
    config = {
      dataflow: {
        enabled: true,
        gcpPubSub: {
          subscriptionName: 'bar'
        }
      }
    }

    t.throws(() => dataflow(config, log))
  }
)

test(
  'setup missing subscriptionName', async (t) => {
    config = {
      dataflow: {
        enabled: true,
        gcpPubSub: {
          projectId: 'foo'
        }
      }
    }

    t.throws(() => dataflow(config, log))
  }
)

test(
  'setup valid config', async (t) => {
    config = {
      dataflow: {
        enabled: true,
        gcpPubSub: {
          projectId: 'foo',
          subscriptionName: 'bar'
        }
      }
    }

    dataflow(config, log)
  }
)

test('subscription is established to the expected Project ID/Subscription', async (t) => {
  t.equal(PubSub.PubSub.calledOnceWith({ projectId: 'foo' }), true)
  t.equal(pubsub.subscription.calledOnceWith('bar'), true)
})

test('subscription messages are listened for', async (t) => {
  t.equal(subscription.on.calledTwice, true)
  t.equal(subscription.on.args[0][0], 'message')
  t.type(subscription.on.args[0][1], 'function')

  t.equal(subscription.on.args[1][0], 'error')
  t.type(subscription.on.args[1][1], 'function')
})

test('subscription messages are acked and logged', async (t) => {
  const messageHandler = subscription.on.args[0][1]

  const message1Mock = {
    ack: sinon.spy(),
    id: 'message1',
    data: Buffer.from('wibble'),
    attributes: {
      quix: 'quux'
    }
  }

  const message2Mock = {
    ack: sinon.spy(),
    id: 'message2',
    data: Buffer.from('wobble'),
    attributes: {
      garply: 'waldo'
    }
  }

  messageHandler(message1Mock)

  t.equal(log.info.calledOnceWith({
    op: 'fxa.customs.dataflow.message',
    count: 0,
    id: 'message1',
    data: 'wibble',
    attributes: {
      quix: 'quux'
    }
  }), true)

  t.equal(message1Mock.ack.calledOnce, true)

  messageHandler(message2Mock)

  t.equal(log.info.calledTwice, true)
  t.equal(log.info.calledWith({
    op: 'fxa.customs.dataflow.message',
    count: 1,
    id: 'message2',
    data: 'wobble',
    attributes: {
      garply: 'waldo'
    }
  }), true)

  t.equal(message2Mock.ack.calledOnce, true)
})

test('subscription errors are logged', async (t) => {
  const errorHandler = subscription.on.args[1][1]
  errorHandler('this is an error')

  t.same(log.error.args[0][0], {
    error: 'this is an error',
    op: 'fxa.customs.dataflow.error'
  })
})
