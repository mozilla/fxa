/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const AppError = require('../../../lib/error');
const { assert } = require('chai');
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');
const P = require('../../../lib/promise');
const sinon = require('sinon');

function makeRoutes(options = {}, dependencies) {
  const log = options.log || mocks.mockLog();
  const db = options.db || mocks.mockDB();
  return require('../../../lib/routes/sms')(
    log,
    db,
    options.config,
    mocks.mockCustoms(),
    options.sms
  );
}

function runTest(route, request) {
  return route.handler(request);
}

describe('/sms with the signinCodes feature included in the payload', () => {
  let log, signinCode, db, config, sms, routes, route, request, response;

  beforeEach(() => {
    log = mocks.mockLog();
    signinCode = Buffer.from('++//ff0=', 'base64');
    db = mocks.mockDB({ signinCode });
    config = {
      sms: {
        enabled: true,
        countryCodes: ['AT', 'CA', 'DE', 'GB', 'US'],
        isStatusGeoEnabled: true,
      },
    };
    sms = {
      send: sinon.spy(() => P.resolve()),
    };
    routes = makeRoutes({ log, db, config, sms });
    route = getRoute(routes, '/sms');
    request = mocks.mockRequest({
      credentials: {
        email: 'foo@example.org',
        uid: 'bar',
      },
      features: ['signinCodes'],
      log: log,
      payload: {
        messageId: 1,
        metricsContext: {
          flowBeginTime: Date.now(),
          flowId:
            '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        },
      },
    });
  });

  describe('sms.send succeeds', () => {
    beforeEach(() => {
      sms.send = sinon.spy(() => P.resolve());
    });

    describe('USA phone number', () => {
      beforeEach(() => {
        request.payload.phoneNumber = '+18885083401';
        return runTest(route, request).then(
          _response => (response = _response)
        );
      });

      it('called log.begin correctly', () => {
        assert.equal(log.begin.callCount, 1);
        const args = log.begin.args[0];
        assert.equal(args.length, 2);
        assert.equal(args[0], 'sms.send');
        assert.equal(args[1], request);
      });

      it('called request.validateMetricsContext correctly', () => {
        assert.equal(request.validateMetricsContext.callCount, 1);
        const args = request.validateMetricsContext.args[0];
        assert.equal(args.length, 0);
      });

      it('called db.createSigninCode correctly', () => {
        assert.equal(db.createSigninCode.callCount, 1);
        const args = db.createSigninCode.args[0];
        assert.equal(args.length, 2);
        assert.equal(args[0], 'bar');
        assert.equal(args[1], request.payload.metricsContext.flowId);
      });

      it('called sms.send correctly', () => {
        assert.equal(sms.send.callCount, 1);
        const args = sms.send.args[0];
        assert.equal(args.length, 4);
        assert.equal(args[0], '+18885083401');
        assert.equal(args[1], 'installFirefox');
        assert.equal(args[2], 'en-US');
        assert.equal(args[3], signinCode);
      });

      it('called log.flowEvent correctly', () => {
        assert.equal(log.flowEvent.callCount, 2);

        let args = log.flowEvent.args[0];
        assert.equal(args.length, 1);
        assert.equal(args[0].event, 'sms.region.US');
        assert.equal(args[0].flow_id, request.payload.metricsContext.flowId);

        args = log.flowEvent.args[1];
        assert.equal(args.length, 1);
        assert.equal(args[0].event, 'sms.installFirefox.sent');
        assert.equal(args[0].flow_id, request.payload.metricsContext.flowId);
      });

      it('returns a formattedPhoneNumber', () => {
        assert.equal(response.formattedPhoneNumber, '888-508-3401');
      });
    });

    describe('Canada phone number', () => {
      beforeEach(() => {
        request.payload.phoneNumber = '+14168483114';
        return runTest(route, request).then(
          _response => (response = _response)
        );
      });

      it('called log.begin once', () => {
        assert.equal(log.begin.callCount, 1);
      });

      it('called request.validateMetricsContext once', () => {
        assert.equal(request.validateMetricsContext.callCount, 1);
      });

      it('called db.createSigninCode once', () => {
        assert.equal(db.createSigninCode.callCount, 1);
      });

      it('called sms.send correctly', () => {
        assert.equal(sms.send.callCount, 1);
        const args = sms.send.args[0];
        assert.equal(args[0], '+14168483114');
      });

      it('called log.flowEvent correctly', () => {
        assert.equal(log.flowEvent.callCount, 2);
        assert.equal(log.flowEvent.args[0][0].event, 'sms.region.CA');
      });

      it('returns a formattedPhoneNumber', () => {
        assert.equal(response.formattedPhoneNumber, '416-848-3114');
      });
    });

    describe('UK phone number', () => {
      beforeEach(() => {
        request.payload.phoneNumber = '+442078553000';
        return runTest(route, request).then(
          _response => (response = _response)
        );
      });

      it('called log.begin once', () => {
        assert.equal(log.begin.callCount, 1);
      });

      it('called request.validateMetricsContext once', () => {
        assert.equal(request.validateMetricsContext.callCount, 1);
      });

      it('called db.createSigninCode once', () => {
        assert.equal(db.createSigninCode.callCount, 1);
      });

      it('called sms.send correctly', () => {
        assert.equal(sms.send.callCount, 1);
        const args = sms.send.args[0];
        assert.equal(args[0], '+442078553000');
      });

      it('called log.flowEvent correctly', () => {
        assert.equal(log.flowEvent.callCount, 2);
        assert.equal(log.flowEvent.args[0][0].event, 'sms.region.GB');
      });

      it('returns a formattedPhoneNumber', () => {
        assert.equal(response.formattedPhoneNumber, '20 7855 3000');
      });
    });

    describe('AT phone number', () => {
      beforeEach(() => {
        request.payload.phoneNumber = '+43676641643';
        return runTest(route, request).then(
          _response => (response = _response)
        );
      });

      it('called sms.send correctly', () => {
        assert.equal(sms.send.callCount, 1);
        const args = sms.send.args[0];
        assert.equal(args[0], '+43676641643');
      });

      it('called log.flowEvent correctly', () => {
        assert.equal(log.flowEvent.callCount, 2);
        assert.equal(log.flowEvent.args[0][0].event, 'sms.region.AT');
      });

      it('returns a formattedPhoneNumber', () => {
        assert.equal(response.formattedPhoneNumber, '676 641643');
      });
    });

    describe('DE phone number', () => {
      beforeEach(() => {
        request.payload.phoneNumber = '+49015153563252';
        return runTest(route, request).then(
          _response => (response = _response)
        );
      });

      it('called sms.send correctly', () => {
        assert.equal(sms.send.callCount, 1);
        const args = sms.send.args[0];
        assert.equal(args[0], '+49015153563252');
      });

      it('called log.flowEvent correctly', () => {
        assert.equal(log.flowEvent.callCount, 2);
        assert.equal(log.flowEvent.args[0][0].event, 'sms.region.DE');
      });

      it('returns a formattedPhoneNumber', () => {
        assert.equal(response.formattedPhoneNumber, '1515 3563252');
      });
    });

    describe('invalid phone number', () => {
      let err;

      beforeEach(() => {
        request.payload.phoneNumber = '+15551234567';
        return runTest(route, request).catch(e => {
          err = e;
        });
      });

      it('called log.begin once', () => {
        assert.equal(log.begin.callCount, 1);
      });

      it('called request.validateMetricsContext once', () => {
        assert.equal(request.validateMetricsContext.callCount, 1);
      });

      it('did not call db.createSigninCode', () => {
        assert.equal(db.createSigninCode.callCount, 0);
      });

      it('did not call sms.send', () => {
        assert.equal(sms.send.callCount, 0);
      });

      it('did not call log.flowEvent', () => {
        assert.equal(log.flowEvent.callCount, 0);
      });

      it('threw the correct error data', () => {
        assert.ok(err instanceof AppError);
        assert.equal(err.errno, AppError.ERRNO.INVALID_PHONE_NUMBER);
        assert.equal(err.message, 'Invalid phone number');
      });
    });

    describe('invalid region', () => {
      let err;

      beforeEach(() => {
        request.payload.phoneNumber = '+886287861100';
        return runTest(route, request).catch(e => {
          err = e;
        });
      });

      it('called log.begin once', () => {
        assert.equal(log.begin.callCount, 1);
      });

      it('called request.validateMetricsContext once', () => {
        assert.equal(request.validateMetricsContext.callCount, 1);
      });

      it('did not call db.createSigninCode', () => {
        assert.equal(db.createSigninCode.callCount, 0);
      });

      it('did not call sms.send', () => {
        assert.equal(sms.send.callCount, 0);
      });

      it('called log.flowEvent correctly', () => {
        assert.equal(log.flowEvent.callCount, 1);
        assert.equal(log.flowEvent.args[0][0].event, 'sms.region.TW');
      });

      it('threw the correct error data', () => {
        assert.ok(err instanceof AppError);
        assert.equal(err.errno, AppError.ERRNO.INVALID_REGION);
        assert.equal(err.message, 'Invalid region');
        assert.equal(err.output.payload.region, 'TW');
      });
    });

    describe('too-short phone number', () => {
      let err;

      beforeEach(() => {
        request.payload.phoneNumber = '+18';
        return runTest(route, request).catch(e => {
          err = e;
        });
      });

      it('called log.begin once', () => {
        assert.equal(log.begin.callCount, 1);
      });

      it('called request.validateMetricsContext once', () => {
        assert.equal(request.validateMetricsContext.callCount, 1);
      });

      it('did not call db.createSigninCode', () => {
        assert.equal(db.createSigninCode.callCount, 0);
      });

      it('did not call sms.send', () => {
        assert.equal(sms.send.callCount, 0);
      });

      it('did not call log.flowEvent', () => {
        assert.equal(log.flowEvent.callCount, 0);
      });

      it('threw the correct error data', () => {
        assert.instanceOf(err, AppError);
        assert.equal(err.errno, AppError.ERRNO.INVALID_PHONE_NUMBER);
        assert.equal(err.message, 'Invalid phone number');
      });
    });
  });

  describe('sms.send fails', () => {
    let err;

    beforeEach(() => {
      sms.send = sinon.spy(() =>
        P.reject(AppError.messageRejected('wibble', 7))
      );
      request.payload.phoneNumber = '+18885083401';
      return runTest(route, request).catch(e => {
        err = e;
      });
    });

    it('called log.begin once', () => {
      assert.equal(log.begin.callCount, 1);
    });

    it('called request.validateMetricsContext once', () => {
      assert.equal(request.validateMetricsContext.callCount, 1);
    });

    it('called db.createSigninCode once', () => {
      assert.equal(db.createSigninCode.callCount, 1);
    });

    it('called sms.send once', () => {
      assert.equal(sms.send.callCount, 1);
    });

    it('called log.flowEvent once', () => {
      assert.equal(log.flowEvent.callCount, 1);
    });

    it('threw the correct error data', () => {
      assert.ok(err instanceof AppError);
      assert.equal(err.errno, AppError.ERRNO.MESSAGE_REJECTED);
      assert.equal(err.message, 'Message rejected');
      assert.equal(err.output.payload.reason, 'wibble');
      assert.equal(err.output.payload.reasonCode, 7);
    });
  });
});

describe('/sms without the signinCodes feature included in the payload', () => {
  let log, signinCode, db, config, sms, routes, route, request;

  beforeEach(() => {
    log = mocks.mockLog();
    signinCode = Buffer.from('++//ff0=', 'base64');
    db = mocks.mockDB({ signinCode });
    config = {
      sms: {
        enabled: true,
        countryCodes: ['CA', 'GB', 'US'],
        isStatusGeoEnabled: true,
      },
    };
    sms = {
      send: sinon.spy(() => P.resolve()),
    };
    routes = makeRoutes({ log, db, config, sms });
    route = getRoute(routes, '/sms');
    request = mocks.mockRequest({
      credentials: {
        email: 'foo@example.org',
        uid: 'bar',
      },
      log: log,
      payload: {
        phoneNumber: '+18885083401',
        messageId: 1,
        metricsContext: {
          flowBeginTime: Date.now(),
          flowId:
            '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        },
      },
    });
    sms.send = sinon.spy(() => P.resolve());
    return runTest(route, request);
  });

  it('called log.begin', () => {
    assert.equal(log.begin.callCount, 1);
  });

  it('called request.validateMetricsContext', () => {
    assert.equal(request.validateMetricsContext.callCount, 1);
  });

  it('did not call db.createSigninCode', () => {
    assert.equal(db.createSigninCode.callCount, 0);
  });

  it('called sms.send correctly', () => {
    assert.equal(sms.send.callCount, 1);
    assert.equal(sms.send.args[0][4], undefined);
  });

  it('called log.flowEvent', () => {
    assert.equal(log.flowEvent.callCount, 2);
  });
});

describe('/sms disabled', () => {
  let log, config, routes;

  beforeEach(() => {
    log = mocks.mockLog();
    config = {
      sms: {
        enabled: false,
        isStatusGeoEnabled: true,
      },
    };
    routes = makeRoutes({ log, config });
  });

  it('routes was empty array', () => {
    assert.ok(Array.isArray(routes));
    assert.equal(routes.length, 0);
  });
});

describe('/sms/status', () => {
  let log, config, sms, routes, route;

  beforeEach(() => {
    log = mocks.mockLog();
    config = {
      sms: {
        apiRegion: 'us-east-1',
        enabled: true,
        countryCodes: ['US'],
        isStatusGeoEnabled: true,
      },
      smtp: {},
    };
    sms = {
      isBudgetOk: () => true,
    };
    routes = makeRoutes({ log, config, sms });
    route = getRoute(routes, '/sms/status');
  });

  describe('country is US', () => {
    let request, response;

    beforeEach(() => {
      request = mocks.mockRequest({
        credentials: {
          email: 'foo@example.org',
        },
        log: log,
      });
      return runTest(route, request).then(r => (response = r));
    });

    it('returned the correct response', () => {
      assert.deepEqual(response, { ok: true, country: 'US' });
    });

    it('called log.begin correctly', () => {
      assert.equal(log.begin.callCount, 1);
      const args = log.begin.args[0];
      assert.equal(args.length, 2);
      assert.equal(args[0], 'sms.status');
      assert.equal(args[1], request);
    });

    it('did not call log.error', () => {
      assert.equal(log.error.callCount, 0);
    });
  });

  describe('country is CA', () => {
    let request, response;

    beforeEach(() => {
      request = mocks.mockRequest({
        credentials: {
          email: 'foo@example.org',
        },
        geo: {
          location: {
            countryCode: 'CA',
          },
        },
        log: log,
      });
      return runTest(route, request).then(r => (response = r));
    });

    it('returned the correct response', () => {
      assert.deepEqual(response, { ok: false, country: 'CA' });
    });

    it('called log.begin once', () => {
      assert.equal(log.begin.callCount, 1);
    });

    it('did not call log.error', () => {
      assert.equal(log.error.callCount, 0);
    });
  });

  describe('spend is over budget', () => {
    let request, response;

    beforeEach(() => {
      sms.isBudgetOk = () => false;
      request = mocks.mockRequest({
        credentials: {
          email: 'foo@example.org',
        },
        log: log,
      });
      return runTest(route, request).then(r => (response = r));
    });

    it('returned the correct response', () => {
      assert.deepEqual(response, { ok: false, country: 'US' });
    });

    it('called log.begin once', () => {
      assert.equal(log.begin.callCount, 1);
    });

    it('did not call log.error', () => {
      assert.equal(log.error.callCount, 0);
    });
  });

  describe('missing location', () => {
    let request, response;

    beforeEach(() => {
      request = mocks.mockRequest({
        credentials: {
          email: 'foo@example.org',
        },
        geo: {},
        log,
      });
      return runTest(route, request).then(r => (response = r));
    });

    it('returned the correct response', () => {
      assert.deepEqual(response, { ok: false, country: undefined });
    });

    it('called log.begin once', () => {
      assert.equal(log.begin.callCount, 1);
    });

    it('called log.error correctly', () => {
      assert.equal(log.error.callCount, 1);
      const args = log.error.args[0];
      assert.equal(args.length, 2);
      assert.equal(args[0], 'sms.getGeoData');
      assert.deepEqual(args[1], {
        err: 'missing location data',
      });
    });
  });

  describe('missing country', () => {
    let request, response;

    beforeEach(() => {
      request = mocks.mockRequest({
        credentials: {
          email: 'foo@example.org',
        },
        geo: {
          location: {},
        },
        log: log,
      });
      return runTest(route, request).then(r => (response = r));
    });

    it('returned the correct response', () => {
      assert.deepEqual(response, { ok: false, country: undefined });
    });

    it('called log.begin once', () => {
      assert.equal(log.begin.callCount, 1);
    });

    it('called log.error correctly', () => {
      assert.equal(log.error.callCount, 1);
      const args = log.error.args[0];
      assert.equal(args.length, 2);
      assert.equal(args[0], 'sms.getGeoData');
      assert.deepEqual(args[1], {
        err: 'missing location data',
      });
    });
  });
});

describe('/sms/status with disabled geo-ip lookup', () => {
  let log, config, sms, routes, route, request, response;

  beforeEach(() => {
    log = mocks.mockLog();
    config = {
      sms: {
        enabled: true,
        countryCodes: ['US'],
        isStatusGeoEnabled: false,
      },
    };
    sms = {
      isBudgetOk: () => true,
    };
    routes = makeRoutes({ log, config, sms });
    route = getRoute(routes, '/sms/status');
    request = mocks.mockRequest({
      clientAddress: '127.0.0.1',
      credentials: {
        email: 'foo@example.org',
      },
      geo: {},
      log: log,
    });
    return runTest(route, request).then(r => (response = r));
  });

  it('returned the correct response', () => {
    assert.deepEqual(response, { ok: true, country: undefined });
  });

  it('called log.begin once', () => {
    assert.equal(log.begin.callCount, 1);
  });

  it('called log.warn correctly', () => {
    assert.equal(log.warn.callCount, 1);
    const args = log.warn.args[0];
    assert.equal(args.length, 2);
    assert.equal(args[0], 'sms.getGeoData');
    assert.deepEqual(args[1], {
      warning: 'skipping geolocation step',
    });
  });

  it('did not call log.error', () => {
    assert.equal(log.error.callCount, 0);
  });
});

describe('/sms/status with query param and enabled geo-ip lookup', () => {
  let log, config, sms, routes, route, request, response;

  beforeEach(() => {
    log = mocks.mockLog();
    config = {
      sms: {
        enabled: true,
        countryCodes: ['RO'],
        isStatusGeoEnabled: true,
      },
    };
    sms = {
      isBudgetOk: () => true,
      send: sinon.spy(() => P.resolve()),
    };
    routes = makeRoutes({ log, config, sms });
    route = getRoute(routes, '/sms/status');
    request = mocks.mockRequest({
      credentials: {
        email: 'foo@example.org',
      },
      geo: {
        location: {
          countryCode: 'US',
        },
      },
      query: {
        country: 'RO',
      },
      log: log,
    });
    return runTest(route, request).then(r => (response = r));
  });

  it('returned the correct response', () => {
    assert.deepEqual(response, { ok: true, country: 'RO' });
  });

  it('called log.begin once', () => {
    assert.equal(log.begin.callCount, 1);
  });

  it('did not call log.error', () => {
    assert.equal(log.error.callCount, 0);
  });
});

describe('/sms/status with query param and disabled geo-ip lookup', () => {
  let log, config, sms, routes, route, request, response;

  beforeEach(() => {
    log = mocks.mockLog();
    config = {
      sms: {
        enabled: true,
        countryCodes: ['GB'],
        isStatusGeoEnabled: false,
      },
    };
    sms = {
      isBudgetOk: () => true,
      send: sinon.spy(() => P.resolve()),
    };
    routes = makeRoutes({ log, config, sms });
    route = getRoute(routes, '/sms/status');
    request = mocks.mockRequest({
      credentials: {
        email: 'foo@example.org',
      },
      geo: {
        location: {
          countryCode: 'US',
        },
      },
      query: {
        country: 'GB',
      },
      log: log,
    });
    return runTest(route, request).then(r => (response = r));
  });

  it('returned the correct response', () => {
    assert.deepEqual(response, { ok: true, country: 'GB' });
  });

  it('called log.begin once', () => {
    assert.equal(log.begin.callCount, 1);
  });

  it('did not call log.error', () => {
    assert.equal(log.error.callCount, 0);
  });
});
