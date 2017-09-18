/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const sinon = require('sinon')
const log = {
  activityEvent: sinon.spy(),
  amplitudeEvent: sinon.spy(),
  error: sinon.spy(),
  flowEvent: sinon.spy()
}
const events = require('../../../lib/metrics/events')(log)
const mocks = require('../../mocks')

describe('metrics/events', () => {
  afterEach(() => {
    log.activityEvent.reset()
    log.amplitudeEvent.reset()
    log.error.reset()
    log.flowEvent.reset()
  })

  it('interface is correct', () => {
    assert.equal(typeof events, 'object', 'events is object')
    assert.notEqual(events, null, 'events is not null')
    assert.equal(Object.keys(events).length, 2, 'events has 2 properties')

    assert.equal(typeof events.emit, 'function', 'events.emit is function')
    assert.equal(events.emit.length, 2, 'events.emit expects 2 arguments')

    assert.equal(typeof events.emitRouteFlowEvent, 'function', 'events.emitRouteFlowEvent is function')
    assert.equal(events.emitRouteFlowEvent.length, 1, 'events.emitRouteFlowEvent expects 1 argument')

    assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
    assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')
  })

  it('.emit with missing event', () => {
    const metricsContext = mocks.mockMetricsContext()
    const request = mocks.mockRequest({ metricsContext })
    return events.emit.call(request, '', {})
      .then(() => {
        assert.equal(log.error.callCount, 1, 'log.error was called once')
        const args = log.error.args[0]
        assert.equal(args.length, 1, 'log.error was passed one argument')
        assert.deepEqual(args[0], {
          op: 'metricsEvents.emit',
          missingEvent: true
        }, 'argument was correct')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(log.amplitudeEvent.callCount, 0, 'log.amplitudeEvent was not called')
        assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
        assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
      })
  })

  it('.emit with activity event', () => {
    const metricsContext = mocks.mockMetricsContext()
    const request = mocks.mockRequest({
      headers: {
        'user-agent': 'foo'
      },
      metricsContext,
      query: {
        service: 'bar'
      }
    })
    const data = {
      uid: 'baz'
    }
    return events.emit.call(request, 'device.created', data)
      .then(() => {
        assert.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
        const args = log.activityEvent.args[0]
        assert.equal(args.length, 1, 'log.activityEvent was passed one argument')
        assert.deepEqual(args[0], {
          event: 'device.created',
          userAgent: 'foo',
          service: 'bar',
          uid: 'baz'
        }, 'argument was event data')

        assert.equal(log.amplitudeEvent.callCount, 0, 'log.amplitudeEvent was not called')
        assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
        assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      })
  })

  it('.emit with activity event and missing data', () => {
    const metricsContext = mocks.mockMetricsContext()
    const request = mocks.mockRequest({
      metricsContext,
      payload: {
        service: 'bar'
      }
    })
    return events.emit.call(request, 'device.created')
      .then(() => {
        assert.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
        const args = log.activityEvent.args[0]
        assert.equal(args.length, 1, 'log.activityEvent was passed one argument')
        assert.deepEqual(args[0], {
          event: 'device.created',
          userAgent: 'test user-agent',
          service: 'bar'
        }, 'argument was event data')

        assert.equal(log.amplitudeEvent.callCount, 0, 'log.amplitudeEvent was not called')
        assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
        assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      })
  })

  it('.emit with activity event and missing uid', () => {
    const metricsContext = mocks.mockMetricsContext()
    const request = mocks.mockRequest({ metricsContext })
    return events.emit.call(request, 'device.created', {})
      .then(() => {
        assert.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
        const args = log.activityEvent.args[0]
        assert.equal(args.length, 1, 'log.activityEvent was passed one argument')
        assert.deepEqual(args[0], {
          event: 'device.created',
          service: undefined,
          userAgent: 'test user-agent'
        }, 'argument was event data')

        assert.equal(log.amplitudeEvent.callCount, 0, 'log.amplitudeEvent was not called')
        assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
        assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      })
  })

  it('.emit with flow event', () => {
    const time = Date.now()
    sinon.stub(Date, 'now', () => time)
    const metricsContext = mocks.mockMetricsContext()
    const request = mocks.mockRequest({
      credentials: {
        uid: 'deadbeef'
      },
      metricsContext,
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000,
          flowCompleteSignal: 'account.signed',
          utmCampaign: 'utm campaign',
          utmContent: 'utm content',
          utmMedium: 'utm medium',
          utmSource: 'utm source',
          utmTerm: 'utm term'
        },
        service: 'baz'
      }
    })
    return events.emit.call(request, 'account.reminder')
      .then(() => {
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')
        const args = log.flowEvent.args[0]
        assert.equal(args.length, 1, 'log.flowEvent was passed one argument')
        assert.deepEqual(args[0], {
          event: 'account.reminder',
          flow_id: 'bar',
          flow_time: 1000,
          flowBeginTime: time - 1000,
          flowCompleteSignal: 'account.signed',
          flowType: undefined,
          locale: 'en-US',
          time,
          uid: 'deadbeef',
          userAgent: 'test user-agent',
          utm_campaign: 'utm campaign',
          utm_content: 'utm content',
          utm_medium: 'utm medium',
          utm_source: 'utm source',
          utm_term: 'utm term'
        }, 'argument was event data')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(log.amplitudeEvent.callCount, 0, 'log.amplitudeEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        Date.now.restore()
      })
  })

  it('.emit with flow event and no session token', () => {
    const time = Date.now()
    sinon.stub(Date, 'now', () => time)
    const metricsContext = mocks.mockMetricsContext()
    const request = {
      app: {
        locale: 'en'
      },
      auth: null,
      clearMetricsContext: metricsContext.clear,
      gatherMetricsContext: metricsContext.gather,
      headers: {
        dnt: '1',
        'user-agent': 'foo'
      },
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000,
          flowCompleteSignal: 'account.signed'
        }
      }
    }
    return events.emit.call(request, 'account.reminder')
      .then(() => {
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')
        const args = log.flowEvent.args[0]
        assert.equal(args.length, 1, 'log.flowEvent was passed one argument')
        assert.deepEqual(args[0], {
          event: 'account.reminder',
          flow_id: 'bar',
          flow_time: 1000,
          flowBeginTime: time - 1000,
          flowCompleteSignal: 'account.signed',
          flowType: undefined,
          locale: 'en',
          time,
          userAgent: 'foo'
        }, 'argument was event data')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(log.amplitudeEvent.callCount, 0, 'log.amplitudeEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        Date.now.restore()
      })
  })

  it('.emit with flow event and string uid', () => {
    const time = Date.now()
    sinon.stub(Date, 'now', () => time)
    const metricsContext = mocks.mockMetricsContext()
    const request = mocks.mockRequest({
      headers: {
        dnt: '1',
        'user-agent': 'test user-agent'
      },
      metricsContext,
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000,
          flowCompleteSignal: 'account.signed'
        }
      }
    })
    return events.emit.call(request, 'account.reminder', { uid: 'deadbeef' })
      .then(() => {
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')
        const args = log.flowEvent.args[0]
        assert.equal(args.length, 1, 'log.flowEvent was passed one argument')
        assert.deepEqual(args[0], {
          event: 'account.reminder',
          flow_id: 'bar',
          flow_time: 1000,
          flowBeginTime: time - 1000,
          flowCompleteSignal: 'account.signed',
          flowType: undefined,
          locale: 'en-US',
          time,
          uid: 'deadbeef',
          userAgent: 'test user-agent'
        }, 'argument was event data')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(log.amplitudeEvent.callCount, 0, 'log.amplitudeEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        Date.now.restore()
      })
  })

  it('.emit with flow event and buffer uid', () => {
    const time = Date.now()
    sinon.stub(Date, 'now', () => time)
    const metricsContext = mocks.mockMetricsContext()
    const request = mocks.mockRequest({
      headers: {
        dnt: '1',
        'user-agent': 'test user-agent'
      },
      metricsContext,
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000,
          flowCompleteSignal: 'account.signed'
        }
      }
    })
    return events.emit.call(request, 'account.reminder', { uid: 'deadbeef' })
      .then(() => {
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')
        const args = log.flowEvent.args[0]
        assert.equal(args.length, 1, 'log.flowEvent was passed one argument')
        assert.deepEqual(args[0], {
          event: 'account.reminder',
          flow_id: 'bar',
          flow_time: 1000,
          flowBeginTime: time - 1000,
          flowCompleteSignal: 'account.signed',
          flowType: undefined,
          locale: 'en-US',
          time,
          uid: 'deadbeef',
          userAgent: 'test user-agent'
        }, 'argument was event data')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(log.amplitudeEvent.callCount, 0, 'log.amplitudeEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        Date.now.restore()
      })
  })

  it('.emit with flow event and null uid', () => {
    const time = Date.now()
    sinon.stub(Date, 'now', () => time)
    const metricsContext = mocks.mockMetricsContext()
    const request = mocks.mockRequest({
      headers: {
        dnt: '1',
        'user-agent': 'test user-agent'
      },
      metricsContext,
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000,
          flowCompleteSignal: 'account.signed'
        }
      }
    })
    return events.emit.call(request, 'account.reminder', { uid: null })
      .then(() => {
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')
        const args = log.flowEvent.args[0]
        assert.equal(args.length, 1, 'log.flowEvent was passed one argument')
        assert.deepEqual(args[0], {
          event: 'account.reminder',
          flow_id: 'bar',
          flow_time: 1000,
          flowBeginTime: time - 1000,
          flowCompleteSignal: 'account.signed',
          flowType: undefined,
          locale: 'en-US',
          time,
          userAgent: 'test user-agent'
        }, 'argument was event data')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(log.amplitudeEvent.callCount, 0, 'log.amplitudeEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        Date.now.restore()
      })
  })

  it('.emit with flow event that matches complete signal', () => {
    const time = Date.now()
    sinon.stub(Date, 'now', () => time)
    const metricsContext = mocks.mockMetricsContext()
    const request = mocks.mockRequest({
      headers: {
        dnt: '1',
        'user-agent': 'test user-agent'
      },
      locale: 'fr',
      metricsContext,
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 2000,
          flowCompleteSignal: 'account.reminder',
          flowType: 'registration'
        }
      }
    })
    return events.emit.call(request, 'account.reminder', { locale: 'baz', uid: 'qux' })
      .then(() => {
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(log.flowEvent.callCount, 2, 'log.flowEvent was called twice')
        assert.deepEqual(log.flowEvent.args[0][0], {
          event: 'account.reminder',
          flow_id: 'bar',
          flow_time: 2000,
          flowBeginTime: time - 2000,
          flowCompleteSignal: 'account.reminder',
          flowType: 'registration',
          locale: 'fr',
          time,
          uid: 'qux',
          userAgent: 'test user-agent'
        }, 'argument was event data first time')
        assert.deepEqual(log.flowEvent.args[1][0], {
          event: 'flow.complete',
          flow_id: 'bar',
          flow_time: 2000,
          flowBeginTime: time - 2000,
          flowCompleteSignal: 'account.reminder',
          flowType: 'registration',
          locale: 'fr',
          time,
          uid: 'qux',
          userAgent: 'test user-agent'
        }, 'argument was complete event data second time')

        assert.equal(log.amplitudeEvent.callCount, 1, 'log.amplitudeEvent was called once')
        assert.equal(log.amplitudeEvent.args[0].length, 1, 'log.amplitudeEvent was passed one argument')
        assert.equal(log.amplitudeEvent.args[0][0].event_type, 'fxa_reg - complete', 'log.amplitudeEvent was passed correct event_type')

        assert.equal(metricsContext.clear.callCount, 1, 'metricsContext.clear was called once')
        assert.equal(metricsContext.clear.args[0].length, 0, 'metricsContext.clear was passed no arguments')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        Date.now.restore()
      })
  })

  it('.emit with flow event and missing headers', () => {
    const metricsContext = mocks.mockMetricsContext()
    const request = {
      clearMetricsContext: metricsContext.clear,
      gatherMetricsContext: metricsContext.gather,
      payload: {
        metricsContext: {
          flowId: 'foo',
          flowBeginTime: Date.now() - 1
        }
      }
    }
    return events.emit.call(request, 'account.reminder')
      .then(() => {
        assert.equal(log.error.callCount, 1, 'log.error was called once')
        const args = log.error.args[0]
        assert.equal(args.length, 1, 'log.error was passed one argument')
        assert.deepEqual(args[0], {
          op: 'metricsEvents.emitFlowEvent',
          event: 'account.reminder',
          badRequest: true
        }, 'argument was correct')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(log.amplitudeEvent.callCount, 0, 'log.amplitudeEvent was not called')
        assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
        assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
      })
  })

  it('.emit with flow event and missing flowId', () => {
    const metricsContext = mocks.mockMetricsContext()
    const request = mocks.mockRequest({
      metricsContext,
      payload: {
        metricsContext: {
          flowBeginTime: Date.now() - 1
        }
      }
    })
    return events.emit.call(request, 'account.reminder')
      .then(() => {
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(log.error.callCount, 1, 'log.error was called once')
        assert.deepEqual(log.error.args[0][0], {
          op: 'metricsEvents.emitFlowEvent',
          event: 'account.reminder',
          missingFlowId: true
        }, 'argument was correct')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(log.amplitudeEvent.callCount, 0, 'log.amplitudeEvent was not called')
        assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
      })
  })

  it('.emit with hybrid activity/flow event', () => {
    const time = Date.now()
    sinon.stub(Date, 'now', () => time)
    const metricsContext = mocks.mockMetricsContext()
    const request = mocks.mockRequest({
      headers: {
        dnt: '1',
        'user-agent': 'test user-agent'
      },
      metricsContext,
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 42
        }
      }
    })
    const data = {
      uid: 'baz'
    }
    return events.emit.call(request, 'account.keyfetch', data)
      .then(() => {
        assert.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
        assert.deepEqual(log.activityEvent.args[0][0], {
          event: 'account.keyfetch',
          userAgent: 'test user-agent',
          service: undefined,
          uid: 'baz'
        }, 'activity event data was correct')

        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')
        assert.deepEqual(log.flowEvent.args[0][0], {
          time,
          event: 'account.keyfetch',
          flow_id: 'bar',
          flow_time: 42,
          flowBeginTime: time - 42,
          flowCompleteSignal: undefined,
          flowType: undefined,
          locale: 'en-US',
          uid: 'baz',
          userAgent: 'test user-agent'
        }, 'flow event data was correct')

        assert.equal(log.amplitudeEvent.callCount, 0, 'log.amplitudeEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        Date.now.restore()
      })
  })

  it('.emit with optional flow event and missing flowId', () => {
    const metricsContext = mocks.mockMetricsContext()
    const request = mocks.mockRequest({
      metricsContext,
      payload: {
        metricsContext: {
          flowBeginTime: Date.now() - 1
        }
      }
    })
    const data = {
      uid: 'bar'
    }
    return events.emit.call(request, 'account.keyfetch', data)
      .then(() => {
        assert.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(log.amplitudeEvent.callCount, 0, 'log.amplitudeEvent was not called')
        assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      })
  })

  it('.emit with content-server account.signed event', () => {
    const metricsContext = mocks.mockMetricsContext()
    const request = mocks.mockRequest({
      metricsContext,
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: Date.now() - 1
        }
      },
      query: {
        service: 'content-server'
      }
    })
    const data = {
      uid: 'baz'
    }
    return events.emit.call(request, 'account.signed', data)
      .then(() => {
        assert.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')

        assert.equal(log.amplitudeEvent.callCount, 1, 'log.amplitudeEvent was called once')
        assert.equal(log.amplitudeEvent.args[0].length, 1, 'log.amplitudeEvent was passed one argument')
        assert.equal(log.amplitudeEvent.args[0][0].event_type, 'fxa_activity - cert_signed', 'log.amplitudeEvent was passed correct event_type')
        assert.deepEqual(log.amplitudeEvent.args[0][0].event_properties, {
          service: 'content-server'
        }, 'log.amplitudeEvent was passed correct event properties')
        assert.deepEqual(log.amplitudeEvent.args[0][0].user_properties, {
          flow_id: 'bar',
          sync_device_count: 0,
          ua_browser: request.app.ua.browser,
          ua_version: request.app.ua.browserVersion,
          ua_os: request.app.ua.os,
          user_country: 'United States',
          user_locale: 'en-US',
          user_state: 'California'
        }, 'log.amplitudeEvent was passed correct user properties')

        assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
        assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      })
  })

  it('.emit with sync account.signed event', () => {
    const metricsContext = mocks.mockMetricsContext()
    const request = mocks.mockRequest({
      metricsContext,
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: Date.now() - 1
        }
      },
      query: {
        service: 'sync'
      }
    })
    const data = {
      uid: 'baz'
    }
    return events.emit.call(request, 'account.signed', data)
      .then(() => {
        assert.equal(log.amplitudeEvent.callCount, 1, 'log.amplitudeEvent was called once')
        assert.equal(log.amplitudeEvent.args[0][0].event_properties.service, 'sync', 'log.amplitudeEvent was passed correct service')

        assert.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')
        assert.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      })
  })

  it('.emitRouteFlowEvent with matching route and response.statusCode', () => {
    const time = Date.now()
    sinon.stub(Date, 'now', () => time)
    const metricsContext = mocks.mockMetricsContext()
    const request = mocks.mockRequest({
      headers: {
        dnt: '1',
        'user-agent': 'test user-agent'
      },
      metricsContext,
      path: '/v1/account/create',
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000
        }
      },
      received: time - 42
    })
    return events.emitRouteFlowEvent.call(request, { statusCode: 200 })
      .then(() => {
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(log.flowEvent.callCount, 2, 'log.flowEvent was called twice')

        let args = log.flowEvent.args[0]
        assert.equal(args.length, 1, 'log.flowEvent was passed one argument first time')
        assert.deepEqual(args[0], {
          event: 'route./account/create.200',
          flow_id: 'bar',
          flow_time: 1000,
          flowBeginTime: time - 1000,
          flowCompleteSignal: undefined,
          flowType: undefined,
          locale: 'en-US',
          time,
          userAgent: 'test user-agent'
        }, 'argument was route summary event data')

        args = log.flowEvent.args[1]
        assert.equal(args.length, 1, 'log.flowEvent was passed one argument second time')
        assert.deepEqual(args[0], {
          event: 'route.performance./account/create',
          flow_id: 'bar',
          flow_time: 42,
          flowBeginTime: time - 1000,
          flowCompleteSignal: undefined,
          flowType: undefined,
          locale: 'en-US',
          time,
          userAgent: 'test user-agent'
        }, 'argument was performance event data')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        Date.now.restore()
      })
  })

  it('.emitRouteFlowEvent with matching route and response.output.statusCode', () => {
    const time = Date.now()
    sinon.stub(Date, 'now', () => time)
    const metricsContext = mocks.mockMetricsContext()
    const request = mocks.mockRequest({
      headers: {
        dnt: '1',
        'user-agent': 'test user-agent'
      },
      metricsContext,
      path: '/v1/account/login',
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000
        }
      }
    })
    return events.emitRouteFlowEvent.call(request, { output: { statusCode: 399 } })
      .then(() => {
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')
        assert.deepEqual(log.flowEvent.args[0][0], {
          event: 'route./account/login.399',
          flow_id: 'bar',
          flow_time: 1000,
          flowBeginTime: time - 1000,
          flowCompleteSignal: undefined,
          flowType: undefined,
          locale: 'en-US',
          time,
          userAgent: 'test user-agent'
        }, 'argument was event data')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        Date.now.restore()
      })
  })

  it('.emitRouteFlowEvent with matching route and 400 statusCode', () => {
    const time = Date.now()
    sinon.stub(Date, 'now', () => time)
    const metricsContext = mocks.mockMetricsContext()
    const request = mocks.mockRequest({
      headers: {
        dnt: '1',
        'user-agent': 'test user-agent'
      },
      metricsContext,
      path: '/v1/recovery_email/resend_code',
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000
        }
      }
    })
    return events.emitRouteFlowEvent.call(request, { statusCode: 400 })
      .then(() => {
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')
        assert.deepEqual(log.flowEvent.args[0][0], {
          event: 'route./recovery_email/resend_code.400.999',
          flow_id: 'bar',
          flow_time: 1000,
          flowBeginTime: time - 1000,
          flowCompleteSignal: undefined,
          flowType: undefined,
          locale: 'en-US',
          time,
          userAgent: 'test user-agent'
        }, 'argument was event data')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        Date.now.restore()
      })
  })

  it('.emitRouteFlowEvent with matching route and 400 statusCode with errno', () => {
    const time = Date.now()
    sinon.stub(Date, 'now', () => time)
    const metricsContext = mocks.mockMetricsContext()
    const request = mocks.mockRequest({
      headers: {
        dnt: '1',
        'user-agent': 'test user-agent'
      },
      metricsContext,
      path: '/v1/account/destroy',
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000
        }
      }
    })
    return events.emitRouteFlowEvent.call(request, { statusCode: 400, errno: 42 })
      .then(() => {
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')
        assert.deepEqual(log.flowEvent.args[0][0], {
          event: 'route./account/destroy.400.42',
          flow_id: 'bar',
          flow_time: 1000,
          flowBeginTime: time - 1000,
          flowCompleteSignal: undefined,
          flowType: undefined,
          locale: 'en-US',
          time,
          userAgent: 'test user-agent'
        }, 'argument was event data')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        Date.now.restore()
      })
  })

  it('.emitRouteFlowEvent with non-matching route', () => {
    const metricsContext = mocks.mockMetricsContext()
    const request = mocks.mockRequest({
      metricsContext,
      path: '/v1/account/devices',
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: Date.now() - 1000
        }
      }
    })
    return events.emitRouteFlowEvent.call(request, { statusCode: 200 })
      .then(() => {
        assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
        assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')
        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      })
  })

  it('.emitRouteFlowEvent with matching route and invalid metrics context', () => {
    const metricsContext = mocks.mockMetricsContext({ validate: sinon.spy(() => false) })
    const request = mocks.mockRequest({
      metricsContext,
      path: '/v1/account/destroy',
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: Date.now()
        }
      }
    })
    return events.emitRouteFlowEvent.call(request, { statusCode: 400, errno: 107 })
      .then(() => {
        assert.equal(metricsContext.validate.callCount, 1, 'metricsContext.validate was called once')
        assert.equal(metricsContext.validate.args[0].length, 0, 'metricsContext.validate was passed no arguments')

        assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
        assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')
        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      })
  })

  it('.emitRouteFlowEvent with missing parameter error but valid metrics context', () => {
    const metricsContext = mocks.mockMetricsContext()
    const request = mocks.mockRequest({
      metricsContext,
      path: '/v1/account/destroy',
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: Date.now()
        }
      }
    })
    return events.emitRouteFlowEvent.call(request, { statusCode: 400, errno: 107 })
      .then(() => {
        assert.equal(metricsContext.validate.callCount, 1, 'metricsContext.validate was called once')
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')
        assert.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      })
  })
})
