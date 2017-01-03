/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const sinon = require('sinon')
const log = {
  activityEvent: sinon.spy(),
  error: sinon.spy(),
  flowEvent: sinon.spy()
}
const events = require('../../lib/metrics/events')(log)
const mocks = require('../mocks')

describe('metrics/events', () => {
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
    const request = {
      clearMetricsContext: metricsContext.clear,
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      payload: {
        service: 'bar'
      }
    }
    const data = {
      uid: 'baz'
    }
    return events.emit.call(request, '', data)
      .then(() => {
        assert.equal(log.error.callCount, 1, 'log.error was called once')
        const args = log.error.args[0]
        assert.equal(args.length, 1, 'log.error was passed one argument')
        assert.deepEqual(args[0], {
          op: 'metricsEvents.emit',
          missingEvent: true
        }, 'argument was correct')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
        assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
      }).finally(() => {
        log.error.reset()
      })
  })

  it('.emit with activity event', () => {
    const metricsContext = mocks.mockMetricsContext()
    const request = {
      clearMetricsContext: metricsContext.clear,
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      query: {
        service: 'bar'
      }
    }
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

        assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
        assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        log.activityEvent.reset()
      })
  })

  it('.emit with activity event and missing data', () => {
    const metricsContext = mocks.mockMetricsContext()
    const request = {
      clearMetricsContext: metricsContext.clear,
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      query: {
        service: 'bar'
      }
    }
    return events.emit.call(request, 'device.created')
      .then(() => {
        assert.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
        const args = log.activityEvent.args[0]
        assert.equal(args.length, 1, 'log.activityEvent was passed one argument')
        assert.deepEqual(args[0], {
          event: 'device.created',
          userAgent: 'foo',
          service: 'bar'
        }, 'argument was event data')

        assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
        assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        log.activityEvent.reset()
      })
  })

  it('.emit with activity event and missing uid', () => {
    const metricsContext = mocks.mockMetricsContext()
    const request = {
      clearMetricsContext: metricsContext.clear,
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      query: {
        service: 'bar'
      }
    }
    return events.emit.call(request, 'device.created', {})
      .then(() => {
        assert.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
        const args = log.activityEvent.args[0]
        assert.equal(args.length, 1, 'log.activityEvent was passed one argument')
        assert.deepEqual(args[0], {
          event: 'device.created',
          userAgent: 'foo',
          service: 'bar'
        }, 'argument was event data')

        assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
        assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        log.activityEvent.reset()
      })
  })

  it('.emit with flow event', () => {
    const time = Date.now()
    sinon.stub(Date, 'now', () => time)
    const metricsContext = mocks.mockMetricsContext()
    const request = {
      clearMetricsContext: metricsContext.clear,
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000,
          flowCompleteSignal: 'account.signed'
        },
        service: 'baz'
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
          flowCompleteSignal: 'account.signed',
          service: 'baz',
          time,
          userAgent: 'foo'
        }, 'argument was event data')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        metricsContext.gather.reset()
        log.flowEvent.reset()
        Date.now.restore()
      })
  })

  it('.emit with flow event that matches complete signal', () => {
    const time = Date.now()
    sinon.stub(Date, 'now', () => time)
    const metricsContext = mocks.mockMetricsContext()
    const request = {
      clearMetricsContext: metricsContext.clear,
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 2000,
          flowCompleteSignal: 'account.reminder'
        },
        service: 'baz'
      }
    }
    return events.emit.call(request, 'account.reminder')
      .then(() => {
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(log.flowEvent.callCount, 2, 'log.flowEvent was called twice')
        assert.deepEqual(log.flowEvent.args[0][0], {
          event: 'account.reminder',
          flow_id: 'bar',
          flow_time: 2000,
          flowCompleteSignal: 'account.reminder',
          service: 'baz',
          time,
          userAgent: 'foo'
        }, 'argument was event data first time')
        assert.deepEqual(log.flowEvent.args[1][0], {
          event: 'flow.complete',
          flow_id: 'bar',
          flow_time: 2000,
          flowCompleteSignal: 'account.reminder',
          service: 'baz',
          time,
          userAgent: 'foo'
        }, 'argument was complete event data second time')

        assert.equal(metricsContext.clear.callCount, 1, 'metricsContext.clear was called once')
        assert.equal(metricsContext.clear.args[0].length, 0, 'metricsContext.clear was passed no arguments')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        metricsContext.gather.reset()
        log.flowEvent.reset()
        metricsContext.clear.reset()
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
        },
        service: 'baz'
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
        assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
        assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
      }).finally(() => {
        log.error.reset()
      })
  })

  it('.emit with flow event and missing flowId', () => {
    const metricsContext = mocks.mockMetricsContext()
    const request = {
      clearMetricsContext: metricsContext.clear,
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      payload: {
        metricsContext: {
          flowBeginTime: Date.now() - 1
        },
        service: 'baz'
      }
    }
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
        assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
      }).finally(() => {
        metricsContext.gather.reset()
        log.error.reset()
      })
  })

  it('.emit with hybrid activity/flow event', () => {
    const time = Date.now()
    sinon.stub(Date, 'now', () => time)
    const metricsContext = mocks.mockMetricsContext()
    const request = {
      clearMetricsContext: metricsContext.clear,
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 42
        }
      }
    }
    const data = {
      uid: 'baz'
    }
    return events.emit.call(request, 'account.keyfetch', data)
      .then(() => {
        assert.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
        assert.deepEqual(log.activityEvent.args[0][0], {
          event: 'account.keyfetch',
          userAgent: 'foo',
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
          flowCompleteSignal: undefined,
          service: undefined,
          userAgent: 'foo'
        }, 'flow event data was correct')

        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        log.activityEvent.reset()
        metricsContext.gather.reset()
        log.flowEvent.reset()
        Date.now.restore()
      })
  })

  it('.emit with optional flow event and missing flowId', () => {
    const metricsContext = mocks.mockMetricsContext()
    const request = {
      clearMetricsContext: metricsContext.clear,
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      payload: {
        metricsContext: {
          flowBeginTime: Date.now() - 1
        }
      }
    }
    const data = {
      uid: 'bar'
    }
    return events.emit.call(request, 'account.keyfetch', data)
      .then(() => {
        assert.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        log.activityEvent.reset()
        metricsContext.gather.reset()
      })
  })

  it('.emit with content-server account.signed event', () => {
    const metricsContext = mocks.mockMetricsContext()
    const request = {
      clearMetricsContext: metricsContext.clear,
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: Date.now() - 1
        }
      },
      query: {
        service: 'content-server'
      }
    }
    const data = {
      uid: 'baz'
    }
    return events.emit.call(request, 'account.signed', data)
      .then(() => {
        assert.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
        assert.equal(metricsContext.gather.callCount, 0, 'metricsContext.gather was not called')
        assert.equal(log.flowEvent.callCount, 0, 'log.flowEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        log.activityEvent.reset()
      })
  })

  it('.emit with sync account.signed event', () => {
    const metricsContext = mocks.mockMetricsContext()
    const request = {
      clearMetricsContext: metricsContext.clear,
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: Date.now() - 1
        }
      },
      query: {
        service: 'sync'
      }
    }
    const data = {
      uid: 'baz'
    }
    return events.emit.call(request, 'account.signed', data)
      .then(() => {
        assert.equal(log.activityEvent.callCount, 1, 'log.activityEvent was called once')
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')
        assert.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        log.activityEvent.reset()
        metricsContext.gather.reset()
        log.flowEvent.reset()
      })
  })

  it('.emitRouteFlowEvent with matching route and response.statusCode', () => {
    const time = Date.now()
    sinon.stub(Date, 'now', () => time)
    const metricsContext = mocks.mockMetricsContext()
    const request = {
      clearMetricsContext: metricsContext.clear,
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      path: '/v1/account/create',
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000
        }
      }
    }
    return events.emitRouteFlowEvent.call(request, { statusCode: 200 })
      .then(() => {
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')
        const args = log.flowEvent.args[0]
        assert.equal(args.length, 1, 'log.flowEvent was passed one argument')
        assert.deepEqual(args[0], {
          event: 'route./account/create.200',
          flow_id: 'bar',
          flow_time: 1000,
          flowCompleteSignal: undefined,
          service: undefined,
          time,
          userAgent: 'foo'
        }, 'argument was event data')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        metricsContext.gather.reset()
        log.flowEvent.reset()
        Date.now.restore()
      })
  })

  it('.emitRouteFlowEvent with matching route and response.output.statusCode', () => {
    const time = Date.now()
    sinon.stub(Date, 'now', () => time)
    const metricsContext = mocks.mockMetricsContext()
    const request = {
      clearMetricsContext: metricsContext.clear,
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      path: '/v1/account/login',
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000
        }
      }
    }
    return events.emitRouteFlowEvent.call(request, { output: { statusCode: 399 } })
      .then(() => {
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')
        assert.deepEqual(log.flowEvent.args[0][0], {
          event: 'route./account/login.399',
          flow_id: 'bar',
          flow_time: 1000,
          flowCompleteSignal: undefined,
          service: undefined,
          time,
          userAgent: 'foo'
        }, 'argument was event data')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        metricsContext.gather.reset()
        log.flowEvent.reset()
        Date.now.restore()
      })
  })

  it('.emitRouteFlowEvent with matching route and 400 statusCode', () => {
    const time = Date.now()
    sinon.stub(Date, 'now', () => time)
    const metricsContext = mocks.mockMetricsContext()
    const request = {
      clearMetricsContext: metricsContext.clear,
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      path: '/v1/recovery_email/resend_code',
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000
        }
      }
    }
    return events.emitRouteFlowEvent.call(request, { statusCode: 400 })
      .then(() => {
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')
        assert.deepEqual(log.flowEvent.args[0][0], {
          event: 'route./recovery_email/resend_code.400.999',
          flow_id: 'bar',
          flow_time: 1000,
          flowCompleteSignal: undefined,
          service: undefined,
          time,
          userAgent: 'foo'
        }, 'argument was event data')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        metricsContext.gather.reset()
        log.flowEvent.reset()
        Date.now.restore()
      })
  })

  it('.emitRouteFlowEvent with matching route and 400 statusCode with errno', () => {
    const time = Date.now()
    sinon.stub(Date, 'now', () => time)
    const metricsContext = mocks.mockMetricsContext()
    const request = {
      clearMetricsContext: metricsContext.clear,
      gatherMetricsContext: metricsContext.gather,
      headers: {
        'user-agent': 'foo'
      },
      path: '/v1/account/destroy',
      payload: {
        metricsContext: {
          flowId: 'bar',
          flowBeginTime: time - 1000
        }
      }
    }
    return events.emitRouteFlowEvent.call(request, { statusCode: 400, errno: 42 })
      .then(() => {
        assert.equal(metricsContext.gather.callCount, 1, 'metricsContext.gather was called once')

        assert.equal(log.flowEvent.callCount, 1, 'log.flowEvent was called once')
        assert.deepEqual(log.flowEvent.args[0][0], {
          event: 'route./account/destroy.400.42',
          flow_id: 'bar',
          flow_time: 1000,
          flowCompleteSignal: undefined,
          service: undefined,
          time,
          userAgent: 'foo'
        }, 'argument was event data')

        assert.equal(log.activityEvent.callCount, 0, 'log.activityEvent was not called')
        assert.equal(metricsContext.clear.callCount, 0, 'metricsContext.clear was not called')
        assert.equal(log.error.callCount, 0, 'log.error was not called')
      }).finally(() => {
        metricsContext.gather.reset()
        log.flowEvent.reset()
        Date.now.restore()
      })
  })
})
