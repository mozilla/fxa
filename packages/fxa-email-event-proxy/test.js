// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

'use strict'

const chai = require('chai')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

chai.use(require('chai-as-promised'))

const { assert } = chai

/* eslint-env mocha */

suite('fxa-sendgrid-event-proxy:', () => {
  let sqs, proxy

  setup(() => {
    process.env.SQS_SUFFIX = 'wibble'
    sqs = {
      push: sinon.spy()
    }
    sinon.spy(console, 'log')
    sinon.spy(console, 'error')
    proxy = proxyquire('.', {
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

  suite('call with an event array:', () => {
    let promise

    setup(done => {
      promise = proxy.main([
        {
          email: 'foo@example.com',
          timestamp: 1529507950,
          event: 'processed',
          sg_event_id: 'be8eYqItNxixRpMOG1eoGg==',
          sg_message_id: '14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0'
        },
        {
          email: 'foo@example.com',
          timestamp: 1529507950,
          event: 'deferred',
          sg_event_id: 'J4wu57qAC1ftwo0gu0eMEQ==',
          sg_message_id: '14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0'
        },
        {
          email: 'bar@example.com',
          timestamp: 1529507951,
          event: 'delivered',
          sg_event_id: 'XrVChmcNybFOoRSukqXL-Q==',
          sg_message_id: 'deadbeef.baadf00d.filter0001.16648.5515E0B88.0',
          response: '250 OK'
        },
        {
          email: 'foo@example.com',
          timestamp: 1529507950,
          event: 'open',
          sg_event_id: '-VYMCtsyK2VMiUcizsfHRg==',
          sg_message_id: '14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0'
        },
        {
          email: 'foo@example.com',
          timestamp: 1529507950,
          event: 'click',
          sg_event_id: 'YXTht66W-BqXBMmSO5oYEA==',
          sg_message_id: '14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0'
        },
        {
          email: 'baz@example.com',
          timestamp: 1529507952,
          event: 'bounce',
          sg_event_id: 'ZFhGF8ap7qNCE8sEnJr2nQ==',
          sg_message_id: 'deadbeef.baadf00d',
          status: '5.0.0'
        },
        {
          email: 'qux@example.com',
          timestamp: 1529507953,
          event: 'bounce',
          sg_event_id: 'AFhGF8ap7qNCE8sEnJr2nQ==',
          sg_message_id: 'deadbeef',
          status: '4.0.0'
        },
        {
          email: 'wibble@example.com',
          timestamp: 1529507954,
          event: 'bounce',
          sg_event_id: 'BFhGF8ap7qNCE8sEnJr2nQ==',
          sg_message_id: '1.filter0001.16648.5515E0B88.0',
          status: '5.1.1'
        },
        {
          email: 'blee@example.com',
          timestamp: 1529507955,
          event: 'bounce',
          sg_event_id: 'CFhGF8ap7qNCE8sEnJr2nQ==',
          sg_message_id: '2.filter0001.16648.5515E0B88.0',
          status: '4.2.2'
        },
        {
          email: 'glug@example.com',
          timestamp: 1529507956,
          event: 'bounce',
          sg_event_id: 'DFhGF8ap7qNCE8sEnJr2nQ==',
          sg_message_id: '3.filter0001.16648.5515E0B88.0',
          status: '4.2.3'
        },
        {
          email: 'zip@example.com',
          timestamp: 1529507957,
          event: 'bounce',
          sg_event_id: 'EFhGF8ap7qNCE8sEnJr2nQ==',
          sg_message_id: '4.filter0001.16648.5515E0B88.0',
          status: '5.6.0'
        },
        {
          email: 'pop@example.com',
          timestamp: 1529507958,
          event: 'dropped',
          sg_event_id: 'df7Bf7jbphkC1SxCbaF_og==',
          sg_message_id: '5.filter0001.16648.5515E0B88.0',
          status: '5.0.0'
        },
        {
          email: 'gom@example.com',
          timestamp: 1529507959,
          event: 'spamreport',
          sg_event_id: '9E0fndeHZ8KvAVm6TGOQ2A==',
          sg_message_id: '6.filter0001.16648.5515E0B88.0'
        },
        {
          email: 'foo@example.com',
          timestamp: 1529507950,
          event: 'unsubscribe',
          sg_event_id: '-_DeZAhMEvyjsT3WgS0Cwg==',
          sg_message_id: '14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0'
        },
        {
          email: 'foo@example.com',
          timestamp: 1529507950,
          event: 'group_unsubscribe',
          sg_event_id: 'wpuMn9Ud2ADJqudDQGPMVw==',
          sg_message_id: '14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0'
        },
        {
          email: 'foo@example.com',
          timestamp: 1529507950,
          event: 'group_resubscribe',
          sg_event_id: 'NjTlbHZDYoLQuqhcgyQtqw==',
          sg_message_id: '14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0'
        }
      ])
      setImmediate(done)
    })

    test('sqs.push was called nine times', () => {
      assert.equal(sqs.push.callCount, 9)
    })

    test('sqs.push was called correctly first time', () => {
      const args = sqs.push.args[0]
      assert.lengthOf(args, 3)
      assert.equal(args[0], 'fxa-email-delivery-wibble')
      assert.deepEqual(args[1], {
        notificationType: 'Delivery',
        mail: {
          timestamp: '2018-06-20T15:19:11.000Z',
          messageId: 'deadbeef.baadf00d'
        },
        delivery: {
          timestamp: '2018-06-20T15:19:11.000Z',
          recipients: [ 'bar@example.com' ],
          smtpResponse: '250 OK'
        }
      })
      assert.isFunction(args[2])
      assert.lengthOf(args[2], 2)
    })

    test('sqs.push was called correctly second time', () => {
      const args = sqs.push.args[1]
      assert.lengthOf(args, 3)
      assert.equal(args[0], 'fxa-email-bounce-wibble')
      assert.deepEqual(args[1], {
        notificationType: 'Bounce',
        mail: {
          timestamp: '2018-06-20T15:19:12.000Z',
          messageId: 'deadbeef.baadf00d'
        },
        bounce: {
          bounceType: 'Permanent',
          bounceSubType: 'General',
          bouncedRecipients: [ { emailAddress: 'baz@example.com' } ],
          feedbackId: 'ZFhGF8ap7qNCE8sEnJr2nQ==',
          timestamp: '2018-06-20T15:19:12.000Z'
        }
      })
      assert.isFunction(args[2])
      assert.lengthOf(args[2], 2)
      assert.notEqual(args[2], sqs.push.args[0][2])
    })

    test('sqs.push was called correctly third time', () => {
      const args = sqs.push.args[2]
      assert.deepEqual(args[1], {
        notificationType: 'Bounce',
        mail: {
          timestamp: '2018-06-20T15:19:13.000Z',
          messageId: 'deadbeef'
        },
        bounce: {
          bounceType: 'Transient',
          bounceSubType: 'General',
          bouncedRecipients: [ { emailAddress: 'qux@example.com' } ],
          feedbackId: 'AFhGF8ap7qNCE8sEnJr2nQ==',
          timestamp: '2018-06-20T15:19:13.000Z'
        }
      })
    })

    test('sqs.push was called correctly fourth time', () => {
      const args = sqs.push.args[3]
      assert.deepEqual(args[1], {
        notificationType: 'Bounce',
        mail: {
          timestamp: '2018-06-20T15:19:14.000Z',
          messageId: '1'
        },
        bounce: {
          bounceType: 'Permanent',
          bounceSubType: 'NoEmail',
          bouncedRecipients: [ { emailAddress: 'wibble@example.com' } ],
          feedbackId: 'BFhGF8ap7qNCE8sEnJr2nQ==',
          timestamp: '2018-06-20T15:19:14.000Z'
        }
      })
    })

    test('sqs.push was called correctly fifth time', () => {
      const args = sqs.push.args[4]
      assert.deepEqual(args[1], {
        notificationType: 'Bounce',
        mail: {
          timestamp: '2018-06-20T15:19:15.000Z',
          messageId: '2'
        },
        bounce: {
          bounceType: 'Transient',
          bounceSubType: 'MailboxFull',
          bouncedRecipients: [ { emailAddress: 'blee@example.com' } ],
          feedbackId: 'CFhGF8ap7qNCE8sEnJr2nQ==',
          timestamp: '2018-06-20T15:19:15.000Z'
        }
      })
    })

    test('sqs.push was called correctly sixth time', () => {
      const args = sqs.push.args[5]
      assert.deepEqual(args[1], {
        notificationType: 'Bounce',
        mail: {
          timestamp: '2018-06-20T15:19:16.000Z',
          messageId: '3'
        },
        bounce: {
          bounceType: 'Transient',
          bounceSubType: 'MessageTooLarge',
          bouncedRecipients: [ { emailAddress: 'glug@example.com' } ],
          feedbackId: 'DFhGF8ap7qNCE8sEnJr2nQ==',
          timestamp: '2018-06-20T15:19:16.000Z'
        }
      })
    })

    test('sqs.push was called correctly seventh time', () => {
      const args = sqs.push.args[6]
      assert.deepEqual(args[1], {
        notificationType: 'Bounce',
        mail: {
          timestamp: '2018-06-20T15:19:17.000Z',
          messageId: '4'
        },
        bounce: {
          bounceType: 'Permanent',
          bounceSubType: 'ContentRejected',
          bouncedRecipients: [ { emailAddress: 'zip@example.com' } ],
          feedbackId: 'EFhGF8ap7qNCE8sEnJr2nQ==',
          timestamp: '2018-06-20T15:19:17.000Z'
        }
      })
    })

    test('sqs.push was called correctly eighth time', () => {
      const args = sqs.push.args[7]
      assert.deepEqual(args[1], {
        notificationType: 'Bounce',
        mail: {
          timestamp: '2018-06-20T15:19:18.000Z',
          messageId: '5'
        },
        bounce: {
          bounceType: 'Permanent',
          bounceSubType: 'General',
          bouncedRecipients: [ { emailAddress: 'pop@example.com' } ],
          feedbackId: 'df7Bf7jbphkC1SxCbaF_og==',
          timestamp: '2018-06-20T15:19:18.000Z'
        }
      })
    })

    test('sqs.push was called correctly ninth time', () => {
      const args = sqs.push.args[8]
      assert.deepEqual(args[1], {
        notificationType: 'Complaint',
        mail: {
          timestamp: '2018-06-20T15:19:19.000Z',
          messageId: '6'
        },
        complaint: {
          complainedRecipients: [ { emailAddress: 'gom@example.com' } ],
          feedbackId: '9E0fndeHZ8KvAVm6TGOQ2A==',
          timestamp: '2018-06-20T15:19:19.000Z'
        }
      })
    })

    suite('call first callback without error:', () => {
      setup(() => sqs.push.args[0][2]())

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

    suite('call first callback with error:', () => {
      let error

      setup(done => {
        error = new Error('foo')
        sqs.push.args[0][2](error)
        setImmediate(done)
      })

      teardown(() => promise.catch(() => {}))

      test('console.log was not called', () => {
        assert.equal(console.log.callCount, 0)
      })

      test('console.error was called twice', () => {
        assert.equal(console.error.callCount, 2)
      })

      test('console.error was called correctly first time', () => {
        const args = console.error.args[0]
        assert.lengthOf(args, 2)
        assert.equal(args[0], 'Failed to send event:')
        assert.deepEqual(args[1], {
          notificationType: 'Delivery',
          mail: {
            timestamp: '2018-06-20T15:19:11.000Z',
            messageId: 'deadbeef.baadf00d'
          },
          delivery: {
            timestamp: '2018-06-20T15:19:11.000Z',
            recipients: [ 'bar@example.com' ],
            smtpResponse: '250 OK'
          }
        })
      })

      test('console.error was called correctly second time', () => {
        const args = console.error.args[1]
        assert.lengthOf(args, 1)
        assert.equal(args[0], error.stack)
      })
    })

    suite('call second callback without error:', () => {
      setup(() => sqs.push.args[1][2]())

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

    suite('call ninth callback without error:', () => {
      setup(() => sqs.push.args[8][2]())

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

    suite('call all callbacks without errors:', () => {
      setup(() => sqs.push.args.forEach(args => args[2]()))

      test('promise is resolved', () => {
        assert.isFulfilled(promise)
      })

      test('result is correct', () => {
        return promise.then(result => assert.deepEqual(result, {
          statusCode: 200,
          body: 'Processed 9 events',
          isBase64Encoded: false
        }))
      })
    })

    suite('call all callbacks with one error:', () => {
      setup(() => sqs.push.args.forEach((args, index) => args[2](index === 8 ? new Error() : null)))

      test('promise is resolved', () => {
        assert.isFulfilled(promise)
      })

      test('result is correct', () => {
        return promise.then(result => {
          assert.equal(result.statusCode, 500)
          assert.equal(result.body.indexOf('Error'), 0)
        })
      })
    })
  })

  suite('call with an authorised request object:', () => {
    setup(done => {
      process.env.AUTH = 'authentication string'
      proxy.main({
        body: JSON.stringify({
          email: 'foo@example.com',
          timestamp: 1529507950,
          event: 'delivered',
          sg_event_id: 'be8eYqItNxixRpMOG1eoGg==',
          sg_message_id: '14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0',
          response: '200 OK'
        }),
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
      assert.lengthOf(args, 3)
      assert.equal(args[0], 'fxa-email-delivery-wibble')
      assert.deepEqual(args[1], {
        notificationType: 'Delivery',
        mail: {
          timestamp: '2018-06-20T15:19:10.000Z',
          messageId: '14c5d75ce93.dfd.64b469'
        },
        delivery: {
          timestamp: '2018-06-20T15:19:10.000Z',
          recipients: [ 'foo@example.com' ],
          smtpResponse: '200 OK'
        }
      })
      assert.isFunction(args[2])
      assert.lengthOf(args[2], 2)
    })
  })

  suite('call with an unauthorised request object:', () => {
    let promise

    setup(() => {
      process.env.AUTH = 'authentication string'
      promise = proxy.main({
        body: JSON.stringify({
          email: 'foo@example.com',
          timestamp: 1529507950,
          event: 'delivered',
          sg_event_id: 'be8eYqItNxixRpMOG1eoGg==',
          sg_message_id: '14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0',
          response: '200 OK'
        }),
        queryStringParameters: {
          auth: 'authentication stringx'
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
        statusCode: 401,
        body: 'Unauthorized',
        isBase64Encoded: false
      }))
    })
  })

  suite('call without query params:', () => {
    let promise

    setup(() => {
      promise = proxy.main({
        body: JSON.stringify({
          email: 'foo@example.com',
          timestamp: 1529507950,
          event: 'delivered',
          sg_event_id: 'be8eYqItNxixRpMOG1eoGg==',
          sg_message_id: '14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.0',
          response: '200 OK'
        })
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
        statusCode: 401,
        body: 'Unauthorized',
        isBase64Encoded: false
      }))
    })
  })
})
