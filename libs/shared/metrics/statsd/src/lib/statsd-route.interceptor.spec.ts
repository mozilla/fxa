/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CallHandler, ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StatsD } from 'hot-shots';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';

import {
  SKIP_ROUTE_METRICS_KEY,
  SkipRouteMetrics,
  StatsDRouteInterceptor,
} from './statsd-route.interceptor';

const CONTROLLER_NAME = 'FakeController';
const HANDLER_NAME = 'fakeHandler';
const METHOD = 'GET';

class FakeController {
  fakeHandler() {
    return undefined;
  }
}

const buildStatsD = (): jest.Mocked<Pick<StatsD, 'increment' | 'timing'>> => ({
  increment: jest.fn(),
  timing: jest.fn(),
});

const buildContext = (opts: {
  type: 'http' | 'rpc';
  request?: { method?: string };
  response?: { statusCode?: number };
}): ExecutionContext => {
  const http = {
    getRequest: () => opts.request ?? {},
    getResponse: () => opts.response ?? {},
  };
  return {
    getType: () => opts.type,
    switchToHttp: () => http,
    getClass: () => FakeController,
    getHandler: () => FakeController.prototype.fakeHandler,
  } as unknown as ExecutionContext;
};

const buildHandler = (
  observable: ReturnType<typeof of> | ReturnType<typeof throwError>
): CallHandler => ({
  handle: () => observable,
});

describe('StatsDRouteInterceptor', () => {
  let statsd: ReturnType<typeof buildStatsD>;
  let reflector: Reflector;
  let interceptor: StatsDRouteInterceptor;

  beforeEach(() => {
    statsd = buildStatsD();
    reflector = new Reflector();
    interceptor = new StatsDRouteInterceptor(
      statsd as unknown as StatsD,
      reflector
    );
  });

  it('emits count and timing tagged with controller/handler/method/statusCode on success', async () => {
    const context = buildContext({
      type: 'http',
      request: { method: METHOD },
      response: { statusCode: 201 },
    });

    await firstValueFrom(
      interceptor.intercept(context, buildHandler(of('body')))
    );

    const expectedTags = {
      controller: CONTROLLER_NAME,
      handler: HANDLER_NAME,
      method: METHOD,
      statusCode: '201',
    };
    expect(statsd.increment).toHaveBeenCalledTimes(1);
    expect(statsd.increment).toHaveBeenCalledWith(
      'route.request.count',
      expectedTags
    );
    expect(statsd.timing).toHaveBeenCalledTimes(1);
    expect(statsd.timing).toHaveBeenCalledWith(
      'route.request.duration',
      expect.any(Number),
      expectedTags
    );
  });

  it('defaults statusCode to 200 when the response does not expose one', async () => {
    const context = buildContext({
      type: 'http',
      request: { method: METHOD },
      response: {},
    });

    await firstValueFrom(
      interceptor.intercept(context, buildHandler(of('body')))
    );

    expect(statsd.increment).toHaveBeenCalledWith(
      'route.request.count',
      expect.objectContaining({ statusCode: '200' })
    );
  });

  it('defaults method to UNKNOWN when the request does not expose one', async () => {
    const context = buildContext({
      type: 'http',
      request: {},
      response: { statusCode: 200 },
    });

    await firstValueFrom(
      interceptor.intercept(context, buildHandler(of('body')))
    );

    expect(statsd.increment).toHaveBeenCalledWith(
      'route.request.count',
      expect.objectContaining({ method: 'UNKNOWN' })
    );
  });

  it('tags the metric with the HttpException status when the handler throws HttpException', async () => {
    const context = buildContext({
      type: 'http',
      request: { method: METHOD },
      response: { statusCode: 200 },
    });
    const err = new HttpException('not found', 404);

    await expect(
      firstValueFrom(interceptor.intercept(context, buildHandler(throwError(() => err))))
    ).rejects.toBe(err);

    expect(statsd.increment).toHaveBeenCalledWith(
      'route.request.count',
      expect.objectContaining({ statusCode: '404' })
    );
    expect(statsd.timing).toHaveBeenCalledWith(
      'route.request.duration',
      expect.any(Number),
      expect.objectContaining({ statusCode: '404' })
    );
  });

  it('tags the metric with statusCode 500 when the handler throws a non-HttpException error', async () => {
    const context = buildContext({
      type: 'http',
      request: { method: METHOD },
      response: { statusCode: 200 },
    });
    const err = new Error('boom');

    await expect(
      firstValueFrom(interceptor.intercept(context, buildHandler(throwError(() => err))))
    ).rejects.toBe(err);

    expect(statsd.increment).toHaveBeenCalledWith(
      'route.request.count',
      expect.objectContaining({ statusCode: '500' })
    );
  });

  it('skips emission when @SkipRouteMetrics is applied at the class level', async () => {
    @SkipRouteMetrics()
    class SkippedController {
      handler() {}
    }
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({ method: METHOD }),
        getResponse: () => ({ statusCode: 200 }),
      }),
      getClass: () => SkippedController,
      getHandler: () => SkippedController.prototype.handler,
    } as unknown as ExecutionContext;

    await firstValueFrom(
      interceptor.intercept(context, buildHandler(of('body')))
    );

    expect(statsd.increment).not.toHaveBeenCalled();
    expect(statsd.timing).not.toHaveBeenCalled();
  });

  it('skips emission when @SkipRouteMetrics is applied at the method level', async () => {
    class PartiallySkippedController {
      @SkipRouteMetrics()
      skippedHandler() {}
      tracedHandler() {}
    }
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({ method: METHOD }),
        getResponse: () => ({ statusCode: 200 }),
      }),
      getClass: () => PartiallySkippedController,
      getHandler: () => PartiallySkippedController.prototype.skippedHandler,
    } as unknown as ExecutionContext;

    await firstValueFrom(
      interceptor.intercept(context, buildHandler(of('body')))
    );

    expect(statsd.increment).not.toHaveBeenCalled();
    expect(statsd.timing).not.toHaveBeenCalled();
  });

  it('exports SKIP_ROUTE_METRICS_KEY for external metadata lookups', () => {
    expect(SKIP_ROUTE_METRICS_KEY).toBe('statsdRouteMetrics:skip');
  });

  it('emits metrics when the request is unsubscribed before the handler completes', () => {
    const context = buildContext({
      type: 'http',
      request: { method: METHOD },
      response: { statusCode: 200 },
    });
    const neverEmit = new Observable<unknown>(() => undefined);

    const subscription = interceptor
      .intercept(context, buildHandler(neverEmit))
      .subscribe();

    expect(statsd.increment).not.toHaveBeenCalled();

    subscription.unsubscribe();

    expect(statsd.increment).toHaveBeenCalledTimes(1);
    expect(statsd.increment).toHaveBeenCalledWith(
      'route.request.count',
      expect.objectContaining({
        controller: CONTROLLER_NAME,
        handler: HANDLER_NAME,
        method: METHOD,
        statusCode: '200',
      })
    );
    expect(statsd.timing).toHaveBeenCalledTimes(1);
  });

  it('passes through non-HTTP execution contexts without emitting metrics', async () => {
    const context = buildContext({ type: 'rpc' });

    const result = await firstValueFrom(
      interceptor.intercept(context, buildHandler(of('rpc-body')))
    );

    expect(result).toBe('rpc-body');
    expect(statsd.increment).not.toHaveBeenCalled();
    expect(statsd.timing).not.toHaveBeenCalled();
  });
});
