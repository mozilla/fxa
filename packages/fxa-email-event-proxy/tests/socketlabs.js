// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

'use strict'

const chai = require('chai')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

chai.use(require('chai-as-promised'))

const { assert } = chai

const TEST_VALIDATION_KEY = 'validation'

/* eslint-env mocha */

suite('socketlabs:', () => {
  let sqs, proxy

  setup(() => {
    process.env.AUTH = 'authentication string'
    process.env.PROVIDER = 'socketlabs'
    process.env.SQS_SUFFIX = 'wibble'
    process.env.SOCKETLABS_VALIDATION_KEY = TEST_VALIDATION_KEY
    process.env.SOCKETLABS_SECRET_KEY = 'secret'
    sqs = {
      push: sinon.spy()
    }
    sinon.spy(console, 'log')
    sinon.spy(console, 'error')
    proxy = proxyquire('../', {
      sqs: () => sqs
    })
  })

  teardown(() => {
    console.log.restore()
    console.error.restore()
  })

  test('interface is correct', () => {
    assert.isObject(proxy)
    assert.isFunction(proxy.main)
    assert.lengthOf(proxy.main, 1)
  })

  suite('call with a correct delivery event:', () => {
    let promise

    setup((done) => {
      promise = proxy.main({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'Type=Delivered&DateTime=Tue%2C%2014%20Aug%202018%2016%3A35%3A37%20GMT&MailingId=&MessageId=ca327159-f652-4193-ac67-d3cad0c0fafa&Address=real.email%40example.com&SecretKey=secret&RemoteMta=real-smtp-in.l.example.com&ServerId=99999&Response=250%202.0.0%20OK%201534264537%20z7-v6si7118563qta.91%20-%20gsmtp%0D%0A&LocalIp=10.24.177.135&FromAddress=verification%40latest.dev.lcip.org',
        queryStringParameters: {
          auth: 'authentication string'
        }
      })
      setImmediate(done)
    })

    test('sqs.push was called once', () => {
      assert.equal(sqs.push.callCount, 1)
    })

    test('sqs.push was called correctly', () => {
      const args = sqs.push.args[0]
      assert.deepEqual(JSON.parse(args[1].Message), {
        notificationType: 'Delivery',
        mail: {
          timestamp: '2018-08-14T16:35:37.000Z',
          messageId: 'ca327159-f652-4193-ac67-d3cad0c0fafa'
        },
        delivery: {
          timestamp: '2018-08-14T16:35:37.000Z',
          recipients: [ 'real.email@example.com' ],
          smtpResponse: '250 2.0.0 OK 1534264537 z7-v6si7118563qta.91 - gsmtp\r\n'
        }
      })
    })

    suite('call all callbacks without errors:', () => {
      setup(() => sqs.push.args.forEach(args => args[2]()))

      test('promise is resolved', () => {
        assert.isFulfilled(promise)
      })

      test('result is correct', () => {
        return promise.then(result => assert.deepEqual(result, {
          statusCode: 200,
          body: '{"result":"Processed 1 events","ValidationKey":"validation"}',
          isBase64Encoded: false
        }))
      })

      test('console.log was called correctly', () => {
        assert.equal(console.log.callCount, 1)
        const args = console.log.args[0]
        assert.lengthOf(args, 2)
        assert.equal(args[0], 'Sent:')
        assert.equal(args[1], 'Delivery')
      })

      test('console.error was not called', () => {
        assert.equal(console.error.callCount, 0)
      })
    })
  })

  suite('call with a correct failure event:', () => {
    let promise

    setup((done) => {
      promise = proxy.main({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'Type=Failed&DateTime=Mon%2C%2013%20Aug%202018%2020%3A29%3A59%20GMT&MailingId=&MessageId=bc449116-f031-4e23-98a4-2db3c34dc0cf&Address=foo%40example.com&SecretKey=secret&FailureCode=4003&Reason=500%205.4.0%20System%20rule%20action%20set%20to%20fail%20connection.&RemoteMta=&ServerId=19796&FailureType=0&FromAddress=verification%40latest.dev.lcip.org&BounceStatus=&DiagnosticCode=',
        queryStringParameters: {
          auth: 'authentication string'
        }
      })
      setImmediate(done)
    })

    test('sqs.push was called once', () => {
      assert.equal(sqs.push.callCount, 1)
    })

    test('sqs.push was called correctly', () => {
      const args = sqs.push.args[0]
      assert.deepEqual(JSON.parse(args[1].Message), {
        notificationType: 'Bounce',
        mail: {
          timestamp: '2018-08-13T20:29:59.000Z',
          messageId: 'bc449116-f031-4e23-98a4-2db3c34dc0cf'
        },
        bounce: {
          bounceType: 'Transient',
          bounceSubType: 'General',
          bouncedRecipients: [
            { emailAddress: 'foo@example.com' }
          ],
          timestamp: '2018-08-13T20:29:59.000Z',
          feedbackId: 'bc449116-f031-4e23-98a4-2db3c34dc0cf'
        }
      })
    })

    suite('call all callbacks without errors:', () => {
      setup(() => sqs.push.args.forEach(args => args[2]()))

      test('promise is resolved', () => {
        assert.isFulfilled(promise)
      })

      test('result is correct', () => {
        return promise.then(result => assert.deepEqual(result, {
          statusCode: 200,
          body: '{"result":"Processed 1 events","ValidationKey":"validation"}',
          isBase64Encoded: false
        }))
      })

      test('console.log was called correctly', () => {
        assert.equal(console.log.callCount, 1)
        const args = console.log.args[0]
        assert.lengthOf(args, 2)
        assert.equal(args[0], 'Sent:')
        assert.equal(args[1], 'Bounce')
      })

      test('console.error was not called', () => {
        assert.equal(console.error.callCount, 0)
      })
    })
  })

  suite('call with a correct complaint event:', () => {
    let promise

    setup((done) => {
      promise = proxy.main({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'Type=Complaint&DateTime=Mon%2C%2001%20Oct%202012%2014%3A07%3A26%20GMT&MailingId=m012&MessageId=0000000155&Address=test%40example.com&ServerId=1000&SecretKey=secret&FblType=abuse&UserAgent=Yahoo%21-Mail-Feedback%2F1.0&From=test%40example.com&To=test%40example.com&Length=495',
        queryStringParameters: {
          auth: 'authentication string'
        }
      })
      setImmediate(done)
    })

    test('sqs.push was called once', () => {
      assert.equal(sqs.push.callCount, 1)
    })

    test('sqs.push was called correctly', () => {
      const args = sqs.push.args[0]
      assert.deepEqual(JSON.parse(args[1].Message), {
        notificationType: 'Complaint',
        mail: {
          timestamp: '2012-10-01T14:07:26.000Z',
          messageId: '0000000155'
        },
        complaint: {
          complainedRecipients: [
            { emailAddress: 'test@example.com' }
          ],
          timestamp: '2012-10-01T14:07:26.000Z',
          feedbackId: '0000000155'
        }
      })
    })

    suite('call all callbacks without errors:', () => {
      setup(() => sqs.push.args.forEach(args => args[2]()))

      test('promise is resolved', () => {
        assert.isFulfilled(promise)
      })

      test('result is correct', () => {
        return promise.then(result => assert.deepEqual(result, {
          statusCode: 200,
          body: '{"result":"Processed 1 events","ValidationKey":"validation"}',
          isBase64Encoded: false
        }))
      })

      test('console.log was called correctly', () => {
        assert.equal(console.log.callCount, 1)
        const args = console.log.args[0]
        assert.lengthOf(args, 2)
        assert.equal(args[0], 'Sent:')
        assert.equal(args[1], 'Complaint')
      })

      test('console.error was not called', () => {
        assert.equal(console.error.callCount, 0)
      })
    })
  })

  suite('call with a correct validation event:', () => {
    let promise

    setup(() => {
      promise = proxy.main({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'ServerId=99999&SecretKey=secret&Type=Validation',
        queryStringParameters: {
          auth: 'authentication string'
        }
      })
      return promise
    })

    test('sqs.push was not called', () => {
      assert.equal(sqs.push.callCount, 0)
    })

    test('promise is resolved', () => {
      assert.isFulfilled(promise)
    })

    test('result is correct', () => {
      return promise.then(result => assert.deepEqual(result, {
        statusCode: 200,
        body: '{"ValidationKey":"validation"}',
        isBase64Encoded: false
      }))
    })
  })

  suite('call with an incorrect validation event:', () => {
    let promise

    setup(() => {
      promise = proxy.main({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'ServerId=99999&SecretKey=nope&Type=Validation',
        queryStringParameters: {
          auth: 'authentication string'
        }
      })
      return promise
    })

    test('sqs.push was not called', () => {
      assert.equal(sqs.push.callCount, 0)
    })

    test('promise is resolved', () => {
      assert.isFulfilled(promise)
    })

    test('result is correct', () => {
      return promise.then(result => assert.deepEqual(result, {
        statusCode: 500,
        body: '{"error":"Internal Server Error","errno":999,"code":500,"message":"Invalid Secret Key"}',
        isBase64Encoded: false
      }))
    })
  })

  suite('call with a random event type:', () => {
    let promise

    setup(() => {
      promise = proxy.main({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'ServerId=99999&SecretKey=secret&Type=Random',
        queryStringParameters: {
          auth: 'authentication string'
        }
      })
      return promise
    })

    test('sqs.push was not called', () => {
      assert.equal(sqs.push.callCount, 0)
    })

    test('promise is resolved', () => {
      assert.isFulfilled(promise)
    })

    test('result is correct', () => {
      return promise.then(result => assert.deepEqual(result, {
        statusCode: 200,
        body: '{"result":"Processed 0 events","ValidationKey":"validation"}',
        isBase64Encoded: false
      }))
    })
  })

  suite('call with an incorrect body:', () => {
    let promise

    setup(() => {
      promise = proxy.main({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'incorrect',
        queryStringParameters: {
          auth: 'authentication string'
        }
      })
      return promise
    })

    test('sqs.push was not called', () => {
      assert.equal(sqs.push.callCount, 0)
    })

    test('promise is resolved', () => {
      assert.isFulfilled(promise)
    })

    test('result is correct', () => {
      return promise.then(result => assert.deepEqual(result, {
        statusCode: 200,
        body: '{"result":"Processed 0 events","ValidationKey":"validation"}',
        isBase64Encoded: false
      }))
    })
  })
})
