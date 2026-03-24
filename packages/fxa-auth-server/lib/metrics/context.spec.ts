/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


import crypto from 'crypto';

function hashToken(token: { uid: string; id: string }) {
  const hash = crypto.createHash('sha256');
  hash.update(token.uid);
  hash.update(token.id);
  return hash.digest('base64');
}

describe('metricsContext', () => {
  let results: Record<string, any>;
  let cache: Record<string, jest.Mock>;
  let cacheFactory: jest.Mock;
  let log: any;
  let config: any;
  let metricsContext: any;

  beforeEach(() => {
    jest.resetModules();

    results = {
      del: Promise.resolve(),
      get: Promise.resolve(),
      set: Promise.resolve(),
      exists: Promise.resolve(),
    };
    cache = {
      add: jest.fn().mockImplementation(() => results.add),
      del: jest.fn().mockImplementation(() => results.del),
      get: jest.fn().mockImplementation(() => results.get),
    };
    cacheFactory = jest.fn().mockReturnValue(cache);
    log = require('../../test/mocks').mockLog();
    config = {
      redis: {
        metrics: {
          enabled: true,
          prefix: 'metrics:',
          lifetime: 60,
        },
      },
    };

    jest.doMock('../metricsCache', () => ({
      MetricsRedis: cacheFactory,
    }));

    const contextModule = require('./context');
    metricsContext = contextModule(log, config);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('metricsContext interface is correct', () => {
    // Re-require un-mocked module for static exports check
    const metricsContextModule = jest.requireActual('./context');

    expect(typeof metricsContextModule).toBe('function');
    expect(typeof metricsContextModule.schema).toBe('object');
    expect(metricsContextModule.schema).not.toBeNull();

    expect(typeof metricsContext).toBe('object');
    expect(metricsContext).not.toBeNull();
    expect(Object.keys(metricsContext)).toHaveLength(7);

    expect(typeof metricsContext.stash).toBe('function');
    expect(metricsContext.stash).toHaveLength(1);

    expect(typeof metricsContext.get).toBe('function');
    expect(metricsContext.get).toHaveLength(1);

    expect(typeof metricsContext.gather).toBe('function');
    expect(metricsContext.gather).toHaveLength(1);

    expect(typeof metricsContext.propagate).toBe('function');
    expect(metricsContext.propagate).toHaveLength(2);

    expect(typeof metricsContext.clear).toBe('function');
    expect(metricsContext.clear).toHaveLength(0);

    expect(typeof metricsContext.validate).toBe('function');
    expect(metricsContext.validate).toHaveLength(0);

    expect(typeof metricsContext.setFlowCompleteSignal).toBe('function');
    expect(metricsContext.setFlowCompleteSignal).toHaveLength(2);
  });

  it('instantiated cache correctly', () => {
    expect(cacheFactory).toHaveBeenCalledTimes(1);
    expect(cacheFactory).toHaveBeenCalledWith(config);
  });

  it('metricsContext.stash', async () => {
    results.add = Promise.resolve('wibble');
    results.exists = Promise.resolve(0);
    const token = {
      uid: Array(64).fill('c').join(''),
      id: 'foo',
    };
    await metricsContext.stash.call(
      {
        payload: {
          metricsContext: {
            foo: 'bar',
          },
          service: 'baz',
        },
        query: {},
      },
      token
    );

    expect(cache.add).toHaveBeenCalledTimes(1);
    expect(cache.add.mock.calls[0]).toHaveLength(2);
    expect(cache.add.mock.calls[0][0]).toBe(hashToken(token));
    expect(cache.add.mock.calls[0][1]).toEqual({
      foo: 'bar',
      service: 'baz',
    });

    expect(cache.get).not.toHaveBeenCalled();
  });

  it('metricsContext.stash with clashing data', async () => {
    results.add = Promise.reject('wibble');
    const token = {
      uid: Array(64).fill('c').join(''),
      id: 'foo',
    };
    const result = await metricsContext.stash.call(
      {
        payload: {
          metricsContext: {
            foo: 'bar',
          },
          service: 'baz',
        },
        query: {},
      },
      token
    );

    expect(result).toBeUndefined();
    expect(cache.add).toHaveBeenCalledTimes(1);
  });

  it('metricsContext.stash with service query param', async () => {
    results.add = Promise.resolve('wibble');
    const token = {
      uid: Array(64).fill('c').join(''),
      id: 'foo',
    };
    await metricsContext.stash.call(
      {
        payload: {
          metricsContext: {
            foo: 'bar',
          },
        },
        query: {
          service: 'qux',
        },
      },
      token
    );

    expect(cache.add).toHaveBeenCalledTimes(1);
    expect(cache.add.mock.calls[0][1].service).toBe('qux');
  });

  it('metricsContext.stash with bad token', async () => {
    const result = await metricsContext.stash.call(
      {
        payload: {
          metricsContext: {
            foo: 'bar',
          },
        },
        query: {},
      },
      {
        id: 'foo',
      }
    );

    expect(result).toBeUndefined();
    expect(cache.add).not.toHaveBeenCalled();
  });

  it('metricsContext.stash without metadata', async () => {
    const result = await metricsContext.stash.call(
      {
        payload: {},
        query: {},
      },
      {
        uid: Array(64).fill('c').join(''),
        id: 'foo',
      }
    );

    expect(result).toBeUndefined();
    expect(cache.add).not.toHaveBeenCalled();
  });

  it('metricsContext.get with payload', async () => {
    results.get = Promise.resolve({
      flowId: 'not this flow id',
      flowBeginTime: 0,
    });

    const result = await metricsContext.get({
      payload: {
        metricsContext: {
          flowId: 'mock flow id',
          flowBeginTime: 42,
        },
      },
    });

    expect(result).toEqual({
      flowId: 'mock flow id',
      flowBeginTime: 42,
    });

    expect(cache.get).not.toHaveBeenCalled();
  });

  it('metricsContext.get with payload (duplicate coverage)', async () => {
    results.get = Promise.resolve({
      flowId: 'not this flow id',
      flowBeginTime: 0,
    });
    const result = await metricsContext.get({
      payload: {
        metricsContext: {
          flowId: 'mock flow id',
          flowBeginTime: 42,
        },
      },
    });

    expect(typeof result).toBe('object');
    expect(result).toEqual({
      flowId: 'mock flow id',
      flowBeginTime: 42,
    });

    expect(cache.get).not.toHaveBeenCalled();
  });

  it('metricsContext.get with token', async () => {
    results.get = Promise.resolve({
      flowId: 'flowId',
      flowBeginTime: 1977,
    });

    const token = {
      uid: Array(64).fill('7').join(''),
      id: 'wibble',
    };

    const result = await metricsContext.get({
      auth: {
        credentials: token,
      },
    });

    expect(result).toEqual({
      flowId: 'flowId',
      flowBeginTime: 1977,
    });

    expect(cache.get).toHaveBeenCalledTimes(1);
    expect(cache.get.mock.calls[0]).toHaveLength(1);
    expect(cache.get.mock.calls[0][0]).toBe(hashToken(token));
  });

  it('metricsContext.get with fake token', async () => {
    results.get = Promise.resolve({
      flowId: 'flowId',
      flowBeginTime: 1977,
    });

    const uid = Array(64).fill('7').join('');
    const id = 'wibble';

    const token = { uid, id };

    const result = await metricsContext.get({
      payload: {
        uid,
        code: id,
      },
    });

    expect(result).toEqual({
      flowId: 'flowId',
      flowBeginTime: 1977,
    });

    expect(cache.get).toHaveBeenCalledTimes(1);
    expect(cache.get.mock.calls[0]).toHaveLength(1);
    expect(cache.get.mock.calls[0][0]).toBe(hashToken(token));
    expect(cache.get.mock.calls[0][0]).toEqual(hashToken({ uid, id }));
  });

  it('metricsContext.get with bad token', async () => {
    const result = await metricsContext.get({
      auth: {
        credentials: {
          uid: Array(64).fill('c').join(''),
        },
      },
    });

    expect(result).toEqual({});
  });

  it('metricsContext.get with no token and no payload', async () => {
    const result = await metricsContext.get({
      auth: {},
    });

    expect(result).toEqual({});
  });

  it('metricsContext.get with token and payload', async () => {
    results.get = Promise.resolve({
      flowId: 'foo',
      flowBeginTime: 1977,
    });

    const result = await metricsContext.get({
      auth: {
        credentials: {
          uid: Array(16).fill('f').join(''),
          id: 'bar',
        },
      },
      payload: {
        metricsContext: {
          flowId: 'baz',
          flowBeginTime: 42,
        },
      },
    });

    expect(result).toEqual({
      flowId: 'baz',
      flowBeginTime: 42,
    });

    expect(cache.get).not.toHaveBeenCalled();
  });

  it('metricsContext.get with cache.get error', async () => {
    results.get = Promise.reject('foo');
    const result = await metricsContext.get({
      auth: {
        credentials: {
          uid: Array(16).fill('f').join(''),
          id: 'bar',
        },
      },
    });

    expect(result).toEqual({});

    expect(cache.get).toHaveBeenCalledTimes(1);
  });

  it('metricsContext.gather with metadata', async () => {
    results.get = Promise.resolve({
      flowId: 'not this flow id',
      flowBeginTime: 0,
    });
    const time = Date.now() - 1;
    const result = await metricsContext.gather.call(
      {
        app: {
          metricsContext: Promise.resolve({
            deviceId: 'mock device id',
            flowId: 'mock flow id',
            flowBeginTime: time,
            flowCompleteSignal: 'mock flow complete signal',
            flowType: 'mock flow type',
            context: 'mock context',
            entrypoint: 'mock entry point',
            entrypointExperiment: 'mock entrypoint experiment',
            entrypointVariation: 'mock entrypoint experiment variation',
            migration: 'mock migration',
            service: 'mock service',
            clientId: 'mock client id',
            utmCampaign: 'mock utm_campaign',
            utmContent: 'mock utm_content',
            utmMedium: 'mock utm_medium',
            utmSource: 'mock utm_source',
            utmTerm: 'mock utm_term',
            ignore: 'mock ignorable property',
            productId: 'productId',
            planId: 'planId',
          }),
        },
      },
      {}
    );

    expect(typeof result).toBe('object');
    expect(Object.keys(result)).toHaveLength(19);
    expect(result.time).toBeGreaterThan(time);
    expect(result.device_id).toBe('mock device id');
    expect(result.entrypoint).toBe('mock entry point');
    expect(result.entrypoint_experiment).toBe('mock entrypoint experiment');
    expect(result.entrypoint_variation).toBe(
      'mock entrypoint experiment variation'
    );
    expect(result.flow_id).toBe('mock flow id');
    expect(result.flow_time).toBeGreaterThan(0);
    expect(result.flow_time).toBeLessThan(time);
    expect(result.flowBeginTime).toBe(time);
    expect(result.flowCompleteSignal).toBe('mock flow complete signal');
    expect(result.flowType).toBe('mock flow type');
    expect(result.service).toBe('mock service');
    expect(result.clientId).toBe('mock client id');
    expect(result.utm_campaign).toBe('mock utm_campaign');
    expect(result.utm_content).toBe('mock utm_content');
    expect(result.utm_medium).toBe('mock utm_medium');
    expect(result.utm_source).toBe('mock utm_source');
    expect(result.utm_term).toBe('mock utm_term');

    expect(cache.get).not.toHaveBeenCalled();
  });

  it('metricsContext.gather with clientId only', async () => {
    results.get = Promise.resolve({
      flowId: 'not this flow id',
      flowBeginTime: 0,
    });
    const time = Date.now() - 1;
    const result = await metricsContext.gather.call(
      {
        app: {
          metricsContext: Promise.resolve({
            deviceId: 'mock device id',
            flowId: 'mock flow id',
            flowBeginTime: time,
            flowCompleteSignal: 'mock flow complete signal',
            flowType: 'mock flow type',
            context: 'mock context',
            entrypoint: 'mock entry point',
            entrypointExperiment: 'mock entrypoint experiment',
            entrypointVariation: 'mock entrypoint experiment variation',
            migration: 'mock migration',
            clientId: 'mock client id',
            utmCampaign: 'mock utm_campaign',
            utmContent: 'mock utm_content',
            utmMedium: 'mock utm_medium',
            utmSource: 'mock utm_source',
            utmTerm: 'mock utm_term',
            ignore: 'mock ignorable property',
            productId: 'productId',
            planId: 'planId',
          }),
        },
      },
      {}
    );

    expect(typeof result).toBe('object');
    expect(Object.keys(result)).toHaveLength(18);
    expect(result.time).toBeGreaterThan(time);
    expect(result.device_id).toBe('mock device id');
    expect(result.entrypoint).toBe('mock entry point');
    expect(result.entrypoint_experiment).toBe('mock entrypoint experiment');
    expect(result.entrypoint_variation).toBe(
      'mock entrypoint experiment variation'
    );
    expect(result.flow_id).toBe('mock flow id');
    expect(result.flow_time).toBeGreaterThan(0);
    expect(result.flow_time).toBeLessThan(time);
    expect(result.flowBeginTime).toBe(time);
    expect(result.flowCompleteSignal).toBe('mock flow complete signal');
    expect(result.flowType).toBe('mock flow type');
    expect(result.clientId).toBe('mock client id');
    expect(result.utm_campaign).toBe('mock utm_campaign');
    expect(result.utm_content).toBe('mock utm_content');
    expect(result.utm_medium).toBe('mock utm_medium');
    expect(result.utm_source).toBe('mock utm_source');
    expect(result.utm_term).toBe('mock utm_term');

    expect(cache.get).not.toHaveBeenCalled();
  });

  it('metricsContext.gather with DNT header', async () => {
    const result = await metricsContext.gather.call(
      {
        headers: {
          dnt: '1',
        },
        app: {
          metricsContext: Promise.resolve({
            deviceId: 'mock device id',
            flowId: 'mock flow id',
            flowBeginTime: Date.now(),
            flowCompleteSignal: 'mock flow complete signal',
            flowType: 'mock flow type',
            context: 'mock context',
            entrypoint: 'mock entry point',
            entrypointExperiment: 'mock entrypoint experiment',
            entrypointVariation: 'mock entrypoint experiment variation',
            migration: 'mock migration',
            service: 'mock service',
            utmCampaign: 'mock utm_campaign',
            utmContent: 'mock utm_content',
            utmMedium: 'mock utm_medium',
            utmSource: 'mock utm_source',
            utmTerm: 'mock utm_term',
            ignore: 'mock ignorable property',
          }),
        },
      },
      {}
    );

    expect(Object.keys(result)).toHaveLength(9);
    expect(result.entrypoint).toBeUndefined();
    expect(result.entrypoint_experiment).toBeUndefined();
    expect(result.entrypoint_variation).toBeUndefined();
    expect(result.utm_campaign).toBeUndefined();
    expect(result.utm_content).toBeUndefined();
    expect(result.utm_medium).toBeUndefined();
    expect(result.utm_source).toBeUndefined();
    expect(result.utm_term).toBeUndefined();
  });

  it('metricsContext.gather with bad flowBeginTime', async () => {
    const result = await metricsContext.gather.call(
      {
        app: {
          metricsContext: Promise.resolve({
            flowBeginTime: Date.now() + 10000,
          }),
        },
      },
      {}
    );

    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
    expect(result.flow_time).toBe(0);
  });

  it('metricsContext.propagate', async () => {
    results.get = Promise.resolve('wibble');
    results.add = Promise.resolve();
    const oldToken = {
      uid: Array(64).fill('c').join(''),
      id: 'foo',
    };
    const newToken = {
      uid: Array(64).fill('d').join(''),
      id: 'bar',
    };

    await metricsContext.propagate(oldToken, newToken);

    expect(cache.get).toHaveBeenCalledTimes(1);
    expect(cache.get.mock.calls[0]).toHaveLength(1);
    expect(cache.get.mock.calls[0][0]).toBe(hashToken(oldToken));

    expect(cache.add).toHaveBeenCalledTimes(1);
    expect(cache.add.mock.calls[0]).toHaveLength(2);
    expect(cache.add.mock.calls[0][0]).toBe(hashToken(newToken));
    expect(cache.add.mock.calls[0][1]).toBe('wibble');

    expect(cache.del).not.toHaveBeenCalled();
  });

  it('metricsContext.propagate with clashing data', async () => {
    results.get = Promise.resolve('wibble');
    results.add = Promise.reject('blee');
    const oldToken = {
      uid: Array(64).fill('c').join(''),
      id: 'foo',
    };
    const newToken = {
      uid: Array(64).fill('d').join(''),
      id: 'bar',
    };

    await metricsContext.propagate(oldToken, newToken);

    expect(cache.get).toHaveBeenCalledTimes(1);
    expect(cache.add).toHaveBeenCalledTimes(1);
    expect(cache.del).not.toHaveBeenCalled();
  });

  it('metricsContext.propagate with get error', async () => {
    results.get = Promise.reject('wibble');
    results.add = Promise.resolve();
    const oldToken = {
      uid: Array(64).fill('c').join(''),
      id: 'foo',
    };
    const newToken = {
      uid: Array(64).fill('d').join(''),
      id: 'bar',
    };

    await metricsContext.propagate(oldToken, newToken);

    expect(cache.get).toHaveBeenCalledTimes(1);
    expect(cache.add).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });

  it('metricsContext.clear with token', async () => {
    const token = {
      uid: Array(64).fill('7').join(''),
      id: 'wibble',
    };

    await metricsContext.clear.call({
      auth: {
        credentials: token,
      },
    });

    expect(cache.del).toHaveBeenCalledTimes(1);
    expect(cache.del.mock.calls[0]).toHaveLength(1);
    expect(cache.del.mock.calls[0][0]).toBe(hashToken(token));
  });

  it('metricsContext.clear with fake token', async () => {
    const uid = Array(64).fill('6').join('');
    const id = 'blee';

    await metricsContext.clear.call({
      payload: {
        uid,
        code: id,
      },
    });

    expect(cache.del).toHaveBeenCalledTimes(1);
    expect(cache.del.mock.calls[0]).toHaveLength(1);
    expect(cache.del.mock.calls[0][0]).toEqual(hashToken({ uid, id }));
  });

  it('metricsContext.clear with no token', async () => {
    await metricsContext.clear.call({});

    expect(cache.del).not.toHaveBeenCalled();
  });

  it('metricsContext.clear with cache error', async () => {
    const token = {
      uid: Array(64).fill('7').join(''),
      id: 'wibble',
    };
    results.del = Promise.reject(new Error('blee'));

    await expect(
      metricsContext.clear.call({
        auth: {
          credentials: token,
        },
      })
    ).rejects.toThrow('blee');

    expect(cache.del).toHaveBeenCalledTimes(1);
  });

  it('metricsContext.validate with valid data', () => {
    const flowBeginTime = 1451566800000;
    const flowId =
      '1234567890abcdef1234567890abcdef06146f1d05e7ae215885a4e45b66ff1f';
    jest.spyOn(Date, 'now').mockReturnValue(flowBeginTime + 59999);
    const mockLog = require('../../test/mocks').mockLog();
    const mockConfig = {
      redis: { metrics: {} },
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'S3CR37',
      },
    };
    const mockRequest = {
      headers: {
        'user-agent': 'test-agent',
      },
      payload: {
        metricsContext: {
          flowId,
          flowBeginTime,
        },
      },
    };

    jest.doMock('../metricsCache', () => ({
      MetricsRedis: jest.fn().mockReturnValue(cache),
    }));
    const localContext = require('./context')(mockLog, mockConfig);
    const result = localContext.validate.call(mockRequest);

    expect(result).toBe(true);
    expect(mockRequest.payload.metricsContext.flowId).toBe(
      '1234567890abcdef1234567890abcdef06146f1d05e7ae215885a4e45b66ff1f'
    );
  });

  it('metricsContext.validate with missing payload', () => {
    const mockLog = require('../../test/mocks').mockLog();
    const mockConfig = {
      redis: { metrics: {} },
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'test',
      },
    };
    const mockRequest = {
      headers: {
        'user-agent': 'test-agent',
      },
    };

    jest.doMock('../metricsCache', () => ({
      MetricsRedis: jest.fn().mockReturnValue(cache),
    }));
    const localContext = require('./context')(mockLog, mockConfig);
    const valid = localContext.validate.call(mockRequest);

    expect(valid).toBe(false);
  });

  it('metricsContext.validate with missing data bundle', () => {
    const mockLog = require('../../test/mocks').mockLog();
    const mockConfig = {
      redis: { metrics: {} },
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'test',
      },
    };
    const mockRequest = {
      headers: {
        'user-agent': 'test-agent',
      },
      payload: {
        email: 'test@example.com',
        // note that 'metricsContext' key is absent
      },
    };

    jest.doMock('../metricsCache', () => ({
      MetricsRedis: jest.fn().mockReturnValue(cache),
    }));
    const localContext = require('./context')(mockLog, mockConfig);
    const valid = localContext.validate.call(mockRequest);

    expect(valid).toBe(false);
  });

  it('metricsContext.validate with missing flowId', () => {
    const mockLog = require('../../test/mocks').mockLog();
    const mockConfig = {
      redis: { metrics: {} },
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'test',
      },
    };
    const mockRequest = {
      headers: {
        'user-agent': 'test-agent',
      },
      payload: {
        metricsContext: {
          flowBeginTime: Date.now() - 1,
        } as any,
      },
    };

    jest.doMock('../metricsCache', () => ({
      MetricsRedis: jest.fn().mockReturnValue(cache),
    }));
    const localContext = require('./context')(mockLog, mockConfig);
    const valid = localContext.validate.call(mockRequest);

    expect(valid).toBe(false);
    expect(mockRequest.payload.metricsContext.flowBeginTime).toBeFalsy();
  });

  it('metricsContext.validate with missing flowBeginTime', () => {
    const mockLog = require('../../test/mocks').mockLog();
    const mockConfig = {
      redis: { metrics: {} },
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'test',
      },
    };
    const mockRequest = {
      headers: {
        'user-agent': 'test-agent',
      },
      payload: {
        metricsContext: {
          flowId:
            'f1031df1031df1031df1031df1031df1031df1031df1031df1031df1031df103',
        } as any,
      },
    };

    jest.doMock('../metricsCache', () => ({
      MetricsRedis: jest.fn().mockReturnValue(cache),
    }));
    const localContext = require('./context')(mockLog, mockConfig);
    const valid = localContext.validate.call(mockRequest);

    expect(valid).toBe(false);
    expect(mockRequest.payload.metricsContext.flowId).toBeFalsy();
  });

  it('metricsContext.validate with flowBeginTime that is too old', () => {
    const mockLog = require('../../test/mocks').mockLog();
    const mockConfig = {
      redis: { metrics: {} },
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'test',
      },
    };
    const mockRequest = {
      headers: {
        'user-agent': 'test-agent',
      },
      payload: {
        metricsContext: {
          flowId:
            'f1031df1031df1031df1031df1031df1031df1031df1031df1031df1031df103',
          flowBeginTime: Date.now() - mockConfig.metrics.flow_id_expiry - 1,
        },
      },
    };

    jest.doMock('../metricsCache', () => ({
      MetricsRedis: jest.fn().mockReturnValue(cache),
    }));
    const localContext = require('./context')(mockLog, mockConfig);
    const valid = localContext.validate.call(mockRequest);

    expect(valid).toBe(false);
    expect(mockRequest.payload.metricsContext.flowId).toBeFalsy();
  });

  it('metricsContext.validate with an invalid flow signature', () => {
    const mockLog = require('../../test/mocks').mockLog();
    const mockConfig = {
      redis: { metrics: {} },
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'test',
      },
    };
    const mockRequest = {
      headers: {
        'user-agent': 'test-agent',
      },
      payload: {
        metricsContext: {
          flowId:
            'f1031df1031df1031df1031df1031df1031df1031df1031df1031df1031df103',
          flowBeginTime: Date.now() - 1,
        },
      },
    };

    jest.doMock('../metricsCache', () => ({
      MetricsRedis: jest.fn().mockReturnValue(cache),
    }));
    const localContext = require('./context')(mockLog, mockConfig);
    const valid = localContext.validate.call(mockRequest);

    expect(valid).toBe(false);
    expect(mockRequest.payload.metricsContext.flowId).toBeFalsy();
  });

  it('metricsContext.validate with flow signature from different key', () => {
    const expectedTime = 1451566800000;
    const expectedSalt = '4d6f7a696c6c6146697265666f782121';
    const expectedHmac = '2a204a6d26b009b26b3116f643d84c6f';
    const mockLog = require('../../test/mocks').mockLog();
    const mockConfig = {
      redis: { metrics: {} },
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'ThisIsTheWrongKey',
      },
    };
    const mockRequest = {
      headers: {
        'user-agent': 'Firefox',
      },
      payload: {
        metricsContext: {
          flowId: expectedSalt + expectedHmac,
          flowBeginTime: expectedTime,
        },
      },
    };
    jest.spyOn(Date, 'now').mockReturnValue(expectedTime + 20000);

    jest.doMock('../metricsCache', () => ({
      MetricsRedis: jest.fn().mockReturnValue(cache),
    }));
    const localContext = require('./context')(mockLog, mockConfig);
    const valid = localContext.validate.call(mockRequest);

    expect(valid).toBe(false);
    expect(mockRequest.payload.metricsContext.flowId).toBeFalsy();
  });

  it('metricsContext.validate with flow signature from different timestamp', () => {
    const expectedTime = 1451566800000;
    const expectedSalt = '4d6f7a696c6c6146697265666f782121';
    const expectedHmac = '2a204a6d26b009b26b3116f643d84c6f';
    const mockLog = require('../../test/mocks').mockLog();
    const mockConfig = {
      redis: { metrics: {} },
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'S3CR37',
      },
    };
    const mockRequest = {
      headers: {
        'user-agent': 'Firefox',
      },
      payload: {
        metricsContext: {
          flowId: expectedSalt + expectedHmac,
          flowBeginTime: expectedTime - 1,
        },
      },
    };
    jest.spyOn(Date, 'now').mockReturnValue(expectedTime + 20000);

    jest.doMock('../metricsCache', () => ({
      MetricsRedis: jest.fn().mockReturnValue(cache),
    }));
    const localContext = require('./context')(mockLog, mockConfig);
    const valid = localContext.validate.call(mockRequest);

    expect(valid).toBe(false);
    expect(mockRequest.payload.metricsContext.flowId).toBeFalsy();
  });

  it('metricsContext.validate with flow signature including user agent', () => {
    const expectedTime = 1451566800000;
    // This is the correct signature for the *old* recipe, where we used
    // to include the user agent string in the hash. The test is expected
    // to fail because we don't support that recipe any more.
    const expectedSalt = '4d6f7a696c6c6146697265666f782121';
    const expectedHmac = 'c89d56556d22039fbbf54d34e0baf206';
    const mockLog = require('../../test/mocks').mockLog();
    const mockConfig = {
      redis: { metrics: {} },
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'S3CR37',
      },
    };
    const mockRequest = {
      headers: {
        'user-agent': 'Firefox',
      },
      payload: {
        metricsContext: {
          flowId: expectedSalt + expectedHmac,
          flowBeginTime: expectedTime,
        },
      },
    };
    jest.spyOn(Date, 'now').mockReturnValue(expectedTime + 20000);

    jest.doMock('../metricsCache', () => ({
      MetricsRedis: jest.fn().mockReturnValue(cache),
    }));
    const localContext = require('./context')(mockLog, mockConfig);
    const valid = localContext.validate.call(mockRequest);

    expect(valid).toBe(false);
    expect(mockRequest.payload.metricsContext.flowId).toBeFalsy();
  });

  it('metricsContext.validate with flow signature compared without user agent', () => {
    const flowBeginTime = 1451566800000;
    const flowId =
      '1234567890abcdef1234567890abcdef06146f1d05e7ae215885a4e45b66ff1f';
    jest.spyOn(Date, 'now').mockReturnValue(flowBeginTime + 59999);
    const mockLog = require('../../test/mocks').mockLog();
    const mockConfig = {
      redis: { metrics: {} },
      metrics: {
        flow_id_expiry: 60000,
        flow_id_key: 'S3CR37',
      },
    };
    const mockRequest = {
      headers: {
        'user-agent': 'some other user agent',
      },
      payload: {
        metricsContext: {
          flowId,
          flowBeginTime,
        },
      },
    };

    jest.doMock('../metricsCache', () => ({
      MetricsRedis: jest.fn().mockReturnValue(cache),
    }));
    const localContext = require('./context')(mockLog, mockConfig);
    const result = localContext.validate.call(mockRequest);

    expect(result).toBe(true);
    expect(mockRequest.payload.metricsContext.flowId).toBe(
      '1234567890abcdef1234567890abcdef06146f1d05e7ae215885a4e45b66ff1f'
    );
  });

  it('setFlowCompleteSignal', () => {
    const request = {
      payload: {
        metricsContext: {} as any,
      },
    };
    metricsContext.setFlowCompleteSignal.call(request, 'wibble', 'blee');
    expect(request.payload.metricsContext).toEqual({
      flowCompleteSignal: 'wibble',
      flowType: 'blee',
    });
  });

  it('setFlowCompleteSignal without metricsContext', () => {
    const request = {
      payload: {} as any,
    };
    metricsContext.setFlowCompleteSignal.call(request, 'wibble', 'blee');
    expect(request.payload).toEqual({});
  });
});
