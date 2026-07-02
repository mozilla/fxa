/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EventEmitter } from 'events';
import type { NextFunction, Request, Response } from 'express';
import { StatsD } from 'hot-shots';

import { StatsDRouteMiddleware } from './statsd-route.middleware';

type FakeResponse = Response & { finish: () => void };

const buildStatsD = (): jest.Mocked<Pick<StatsD, 'increment' | 'timing'>> => ({
  increment: jest.fn(),
  timing: jest.fn(),
});

const buildRequest = (overrides: Partial<Request> = {}): Request =>
  ({
    method: 'GET',
    path: '/some/path',
    ...overrides,
  }) as unknown as Request;

const buildResponse = (statusCode = 200): FakeResponse => {
  const emitter = new EventEmitter();
  const res = Object.assign(emitter, {
    statusCode,
    finish: () => emitter.emit('finish'),
  });
  return res as unknown as FakeResponse;
};

describe('StatsDRouteMiddleware', () => {
  let statsd: ReturnType<typeof buildStatsD>;
  let middleware: StatsDRouteMiddleware;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    statsd = buildStatsD();
    middleware = new StatsDRouteMiddleware(statsd as unknown as StatsD);
    next = jest.fn();
  });

  it('calls next immediately and defers metric emission to the response finish event', () => {
    const req = buildRequest({ route: { path: '/v1/things/:id' } } as Partial<Request>);
    const res = buildResponse(200);

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(statsd.increment).not.toHaveBeenCalled();
    expect(statsd.timing).not.toHaveBeenCalled();
  });

  it('emits count and timing tagged with method/route/statusCode when the response finishes', () => {
    const req = buildRequest({
      method: 'POST',
      route: { path: '/v1/billing-and-subscriptions' },
    } as Partial<Request>);
    const res = buildResponse(201);

    middleware.use(req, res, next);
    res.finish();

    const expectedTags = {
      method: 'POST',
      route: 'v1/billing-and-subscriptions',
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

  it('emits with statusCode 401 when a guard rejects the request', () => {
    const req = buildRequest({
      route: { path: '/v1/billing-and-subscriptions' },
    } as Partial<Request>);
    const res = buildResponse(401);

    middleware.use(req, res, next);
    res.finish();

    expect(statsd.increment).toHaveBeenCalledWith(
      'route.request.count',
      expect.objectContaining({ statusCode: '401' })
    );
  });

  it('emits with statusCode 500 when the handler throws', () => {
    const req = buildRequest({
      route: { path: '/v1/billing-and-subscriptions' },
    } as Partial<Request>);
    const res = buildResponse(500);

    middleware.use(req, res, next);
    res.finish();

    expect(statsd.increment).toHaveBeenCalledWith(
      'route.request.count',
      expect.objectContaining({ statusCode: '500' })
    );
  });

  it('tags route as "root" when the matched path is just "/"', () => {
    const req = buildRequest({ route: { path: '/' } } as Partial<Request>);
    const res = buildResponse(200);

    middleware.use(req, res, next);
    res.finish();

    expect(statsd.increment).toHaveBeenCalledWith(
      'route.request.count',
      expect.objectContaining({ route: 'root' })
    );
  });

  it('tags route as "unmatched" when Express did not populate req.route', () => {
    const req = buildRequest();
    const res = buildResponse(404);

    middleware.use(req, res, next);
    res.finish();

    expect(statsd.increment).toHaveBeenCalledWith(
      'route.request.count',
      expect.objectContaining({ route: 'unmatched', statusCode: '404' })
    );
  });
});
