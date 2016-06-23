/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var sinon = require('sinon')
var test = require('../ptaptest')
var mocks = require('../mocks')

var metricsContext = require('../../lib/metrics/context')(mocks.mockLog(), {})

test(
  'metricsContext interface is correct',
  function (t) {
    t.equal(typeof metricsContext, 'object', 'metricsContext is object')
    t.notEqual(metricsContext, null, 'metricsContext is not null')
    t.equal(Object.keys(metricsContext).length, 3, 'metricsContext has 3 properties')

    t.equal(typeof metricsContext.schema, 'object', 'metricsContext.schema is object')
    t.notEqual(metricsContext.schema, null, 'metricsContext.schema is not null')

    t.equal(typeof metricsContext.add, 'function', 'metricsContext.add is function')
    t.equal(metricsContext.add.length, 3, 'metricsContext.add expects 3 arguments')

    t.end()
  }
)

test(
  'metricsContext.add without metadata',
  function (t) {
    var result = metricsContext.add({})

    t.equal(typeof result, 'object', 'result is object')
    t.notEqual(result, null, 'result is not null')
    t.equal(Object.keys(result).length, 0, 'result is empty')

    t.end()
  }
)

test(
  'metricsContext.add with metadata',
  function (t) {
    var time = Date.now() - 1
    var result = metricsContext.add({}, {
      flowId: 'mock flow id',
      flowBeginTime: time,
      context: 'mock context',
      entrypoint: 'mock entry point',
      migration: 'mock migration',
      service: 'mock service',
      utmCampaign: 'mock utm_campaign',
      utmContent: 'mock utm_content',
      utmMedium: 'mock utm_medium',
      utmSource: 'mock utm_source',
      utmTerm: 'mock utm_term',
      ignore: 'mock ignorable property'
    })

    t.equal(typeof result, 'object', 'result is object')
    t.notEqual(result, null, 'result is not null')
    t.equal(Object.keys(result).length, 12, 'result has 12 properties')
    t.ok(result.time > time, 'result.time seems correct')
    t.equal(result.flow_id, 'mock flow id', 'result.flow_id is correct')
    t.ok(result.flow_time > 0, 'result.flow_time is greater than zero')
    t.ok(result.flow_time < time, 'result.flow_time is less than the current time')
    t.equal(result.context, 'mock context', 'result.context is correct')
    t.equal(result.entrypoint, 'mock entry point', 'result.entrypoint is correct')
    t.equal(result.migration, 'mock migration', 'result.migration is correct')
    t.equal(result.service, 'mock service', 'result.service is correct')
    t.equal(result.utm_campaign, 'mock utm_campaign', 'result.utm_campaign is correct')
    t.equal(result.utm_content, 'mock utm_content', 'result.utm_content is correct')
    t.equal(result.utm_medium, 'mock utm_medium', 'result.utm_medium is correct')
    t.equal(result.utm_source, 'mock utm_source', 'result.utm_source is correct')
    t.equal(result.utm_term, 'mock utm_term', 'result.utm_term is correct')

    t.end()
  }
)

test(
  'metricsContext.add with bad flowBeginTime',
  function (t) {
    var result = metricsContext.add({}, {
      flowBeginTime: Date.now() + 10000
    })

    t.equal(typeof result, 'object', 'result is object')
    t.notEqual(result, null, 'result is not null')
    t.strictEqual(result.flow_time, 0, 'result.time is zero')

    t.end()
  }
)

test(
  'metricsContext.add with DNT header',
  function (t) {
    var time = Date.now() - 1
    var result = metricsContext.add({}, {
      flowId: 'mock flow id',
      flowBeginTime: time,
      context: 'mock context',
      entrypoint: 'mock entry point',
      migration: 'mock migration',
      service: 'mock service',
      utmCampaign: 'mock utm_campaign',
      utmContent: 'mock utm_content',
      utmMedium: 'mock utm_medium',
      utmSource: 'mock utm_source',
      utmTerm: 'mock utm_term',
      ignore: 'mock ignorable property'
    }, true)

    t.equal(Object.keys(result).length, 7, 'result has 7 properties')
    t.equal(result.utm_campaign, undefined, 'result.utm_campaign is undefined')
    t.equal(result.utm_content, undefined, 'result.utm_content is undefined')
    t.equal(result.utm_medium, undefined, 'result.utm_medium is undefined')
    t.equal(result.utm_source, undefined, 'result.utm_source is undefined')
    t.equal(result.utm_term, undefined, 'result.utm_term is undefined')

    t.end()
  }
)

test(
  'metricsContext.validate with known good data',
  function (t) {
    var expectedTime = 1451566800000
    var expectedSalt = '4d6f7a696c6c6146697265666f782121'
    var expectedHmac = 'c89d56556d22039fbbf54d34e0baf206'
    var mockLog = mocks.spyLog()
    var mockConfig = {
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'S3CR37'
      }
    }
    var mockRequest = {
      headers: {
        'user-agent': 'Firefox'
      },
      payload: {
        metricsContext: {
          flowId: expectedSalt + expectedHmac,
          flowBeginTime: expectedTime
        }
      }
    }
    sinon.stub(Date, 'now', function() {
      return expectedTime + 20000
    })

    try {
      var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
      var valid = metricsContext.validate(mockRequest)
    } finally {
      Date.now.restore()
    }

    t.ok(valid, 'the known good data is treated as valid')
    t.equal(mockLog.warn.callCount, 0, 'log.warn was not called')
    t.equal(mockLog.info.callCount, 1, 'log.info was called once')
    t.ok(mockLog.info.calledWithExactly({
      op: 'metrics.context.validate',
      valid: true,
      agent: 'Firefox'
    }), 'log.info was called with the expected log data')
    t.end()
  }
)

test(
  'metricsContext.validate with missing data bundle',
  function (t) {
    var mockLog = mocks.spyLog()
    var mockConfig = {
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'test'
      }
    }
    var mockRequest = {
      headers: {
        'user-agent': 'test-agent'
      },
      payload: {
        email: 'test@example.com'
        // note that 'metricsContext' key is absent
      }
    }

    var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
    var valid = metricsContext.validate(mockRequest)

    t.notOk(valid, 'the data is treated as invalid')
    t.equal(mockLog.info.callCount, 0, 'log.info was not called')
    t.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
    t.ok(mockLog.warn.calledWithExactly({
      op: 'metrics.context.validate',
      valid: false,
      reason: 'missing context',
      agent: 'test-agent'
    }), 'log.warn was called with the expected log data')
    t.end()
  }
)

test(
  'metricsContext.validate with missing flowId',
  function (t) {
    var mockLog = mocks.spyLog()
    var mockConfig = {
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'test'
      }
    }
    var mockRequest = {
      headers: {
        'user-agent': 'test-agent'
      },
      payload: {
        metricsContext: {
          flowBeginTime: Date.now()
        }
      }
    }

    var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
    var valid = metricsContext.validate(mockRequest)

    t.notOk(valid, 'the data is treated as invalid')
    t.equal(mockLog.info.callCount, 0, 'log.info was not called')
    t.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
    t.ok(mockLog.warn.calledWithExactly({
      op: 'metrics.context.validate',
      valid: false,
      reason: 'missing flowId',
      agent: 'test-agent'
    }), 'log.warn was called with the expected log data')
    t.end()
  }
)

test(
  'metricsContext.validate with missing flowBeginTime',
  function (t) {
    var mockLog = mocks.spyLog()
    var mockConfig = {
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'test'
      }
    }
    var mockRequest = {
      headers: {
        'user-agent': 'test-agent'
      },
      payload: {
        metricsContext: {
          flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103'
        }
      }
    }

    var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
    var valid = metricsContext.validate(mockRequest)

    t.notOk(valid, 'the data is treated as invalid')
    t.equal(mockLog.info.callCount, 0, 'log.info was not called')
    t.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
    t.ok(mockLog.warn.calledWithExactly({
      op: 'metrics.context.validate',
      valid: false,
      reason: 'missing flowBeginTime',
      agent: 'test-agent'
    }), 'log.warn was called with the expected log data')
    t.end()
  }
)

test(
  'metricsContext.validate with flowBeginTime that is too old',
  function (t) {
    var mockLog = mocks.spyLog()
    var mockConfig = {
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'test'
      }
    }
    var mockRequest = {
      headers: {
        'user-agent': 'test-agent'
      },
      payload: {
        metricsContext: {
          flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          flowBeginTime: Date.now() - mockConfig.metrics.flow_id_expiry - 1
        }
      }
    }

    var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
    var valid = metricsContext.validate(mockRequest)

    t.notOk(valid, 'the data is treated as invalid')
    t.equal(mockLog.info.callCount, 0, 'log.info was not called')
    t.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
    t.ok(mockLog.warn.calledWithExactly({
      op: 'metrics.context.validate',
      valid: false,
      reason: 'expired flowBeginTime',
      agent: 'test-agent'
    }), 'log.warn was called with the expected log data')
    t.end()
  }
)

test(
  'metricsContext.validate with an invalid flow signature',
  function (t) {
    var mockLog = mocks.spyLog()
    var mockConfig = {
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'test'
      }
    }
    var mockRequest = {
      headers: {
        'user-agent': 'test-agent'
      },
      payload: {
        metricsContext: {
          flowId: 'F1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF1031DF103',
          flowBeginTime: Date.now()
        }
      }
    }

    var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
    var valid = metricsContext.validate(mockRequest)

    t.notOk(valid, 'the data is treated as invalid')
    t.equal(mockLog.info.callCount, 0, 'log.info was not called')
    t.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
    t.ok(mockLog.warn.calledWithExactly({
      op: 'metrics.context.validate',
      valid: false,
      reason: 'invalid signature',
      agent: 'test-agent'
    }), 'log.warn was called with the expected log data')
    t.end()
  }
)

test(
  'metricsContext.validate with flow signature from different key',
  function (t) {
    var expectedTime = 1451566800000
    var expectedSalt = '4d6f7a696c6c6146697265666f782121'
    var expectedHmac = 'c89d56556d22039fbbf54d34e0baf206'
    var mockLog = mocks.spyLog()
    var mockConfig = {
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'ThisIsTheWrongKey'
      }
    }
    var mockRequest = {
      headers: {
        'user-agent': 'Firefox'
      },
      payload: {
        metricsContext: {
          flowId: expectedSalt + expectedHmac,
          flowBeginTime: expectedTime
        }
      }
    }
    sinon.stub(Date, 'now', function() {
      return expectedTime + 20000
    })

    try {
      var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
      var valid = metricsContext.validate(mockRequest)
    } finally {
      Date.now.restore()
    }

    t.notOk(valid, 'the data is treated as invalid')
    t.equal(mockLog.info.callCount, 0, 'log.info was not called')
    t.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
    t.ok(mockLog.warn.calledWithExactly({
      op: 'metrics.context.validate',
      valid: false,
      reason: 'invalid signature',
      agent: 'Firefox'
    }), 'log.warn was called with the expected log data')
    t.end()
  }
)

test(
  'metricsContext.validate with flow signature from different timestamp',
  function (t) {
    var expectedTime = 1451566800000
    var expectedSalt = '4d6f7a696c6c6146697265666f782121'
    var expectedHmac = 'c89d56556d22039fbbf54d34e0baf206'
    var mockLog = mocks.spyLog()
    var mockConfig = {
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'S3CR37'
      }
    }
    var mockRequest = {
      headers: {
        'user-agent': 'Firefox'
      },
      payload: {
        metricsContext: {
          flowId: expectedSalt + expectedHmac,
          flowBeginTime: expectedTime - 1
        }
      }
    }
    sinon.stub(Date, 'now', function() {
      return expectedTime + 20000
    })

    try {
      var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
      var valid = metricsContext.validate(mockRequest)
    } finally {
      Date.now.restore()
    }

    t.notOk(valid, 'the data is treated as invalid')
    t.equal(mockLog.info.callCount, 0, 'log.info was not called')
    t.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
    t.ok(mockLog.warn.calledWithExactly({
      op: 'metrics.context.validate',
      valid: false,
      reason: 'invalid signature',
      agent: 'Firefox'
    }), 'log.warn was called with the expected log data')
    t.end()
  }
)

test(
  'metricsContext.validate with flow signature from different user agent',
  function (t) {
    var expectedTime = 1451566800000
    var expectedSalt = '4d6f7a696c6c6146697265666f782121'
    var expectedHmac = 'c89d56556d22039fbbf54d34e0baf206'
    var mockLog = mocks.spyLog()
    var mockConfig = {
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'S3CR37'
      }
    }
    var mockRequest = {
      headers: {
        'user-agent': 'ThisIsNotFirefox'
      },
      payload: {
        metricsContext: {
          flowId: expectedSalt + expectedHmac,
          flowBeginTime: expectedTime
        }
      }
    }
    sinon.stub(Date, 'now', function() {
      return expectedTime + 20000
    })

    try {
      var metricsContext = require('../../lib/metrics/context')(mockLog, mockConfig)
      var valid = metricsContext.validate(mockRequest)
    } finally {
      Date.now.restore()
    }

    t.notOk(valid, 'the data is treated as invalid')
    t.equal(mockLog.info.callCount, 0, 'log.info was not called')
    t.equal(mockLog.warn.callCount, 1, 'log.warn was called once')
    t.ok(mockLog.warn.calledWithExactly({
      op: 'metrics.context.validate',
      valid: false,
      reason: 'invalid signature',
      agent: 'ThisIsNotFirefox'
    }), 'log.warn was called with the expected log data')
    t.end()
  }
)
