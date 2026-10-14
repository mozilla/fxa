/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/node';
import * as celebrateModule from 'celebrate';
import { CelebrateError } from 'celebrate';
import express from 'express';
import { ILogger } from '@fxa/shared/log';
import cors from './cors';
import { routing as routingFactory, RouteDefinition } from './routing';

jest.mock('celebrate', () => ({
  ...jest.requireActual('celebrate'),
  celebrate: jest.fn(),
  isCelebrateError: jest.fn(),
  errors: jest.fn(),
}));
jest.mock('./cors', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@sentry/node', () => ({
  withScope: jest.fn((cb) => cb({ setContext: jest.fn() })),
  captureMessage: jest.fn(),
}));

describe('express/routing', () => {
  const celebrateHandler = jest.fn();
  const corsHandler = jest.fn();
  let errorHandler: jest.Mock;
  let appMock: Record<string, jest.Mock>;
  let loggerMock: { [K in keyof ILogger]: jest.Mock };
  let routing: ReturnType<typeof routingFactory>;
  const req = {} as express.Request;
  const res = {} as express.Response;

  beforeEach(() => {
    jest.clearAllMocks();
    errorHandler = jest.fn();
    (celebrateModule.celebrate as jest.Mock).mockReturnValue(celebrateHandler);
    (celebrateModule.isCelebrateError as unknown as jest.Mock).mockReturnValue(
      false
    );
    (celebrateModule.errors as jest.Mock).mockReturnValue(errorHandler);
    (cors as unknown as jest.Mock).mockReturnValue(corsHandler);

    appMock = {
      delete: jest.fn(),
      get: jest.fn(),
      options: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
    };
    loggerMock = {
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    };

    routing = routingFactory(appMock as unknown as express.Express, loggerMock);
  });

  it('exposes the correct interface', () => {
    expect(Object.keys(routing)).toHaveLength(2);
    expect(typeof routing.addRoute).toBe('function');
    expect(typeof routing.validationErrorHandler).toBe('function');
  });

  describe('addRoute', () => {
    it('logs and throws on invalid route definitions', () => {
      const routeDefinition = {
        path: 'no-process-no-method',
      } as unknown as RouteDefinition;

      expect(() => routing.addRoute(routeDefinition)).toThrow(
        'Invalid route definition'
      );
      expect(loggerMock.error).toHaveBeenCalledTimes(1);
      expect(loggerMock.error).toHaveBeenCalledWith(
        'route definition invalid: ',
        routeDefinition
      );
    });

    it('handles a basic route', () => {
      const routeDefinition: RouteDefinition = {
        method: 'get',
        path: '/metrics',
        process: () => {},
      };

      routing.addRoute(routeDefinition);

      expect(appMock.options).not.toHaveBeenCalled();
      expect(appMock.get).toHaveBeenCalledTimes(1);
      expect(appMock.get).toHaveBeenCalledWith(
        '/metrics',
        routeDefinition.process
      );
    });

    it('handles a route with CORS enabled', () => {
      const corsConfig = { foo: 'bar' };
      const routeDefinition: RouteDefinition = {
        method: 'post',
        path: '/cors-enabled',
        process: () => {},
        cors: corsConfig,
      };

      routing.addRoute(routeDefinition);

      expect(cors).toHaveBeenCalledWith(corsConfig);
      expect(appMock.options).toHaveBeenCalledTimes(1);
      expect(appMock.options).toHaveBeenCalledWith(
        '/cors-enabled',
        corsHandler
      );
      expect(appMock.post).toHaveBeenCalledWith(
        '/cors-enabled',
        corsHandler,
        routeDefinition.process
      );
    });

    it('handles a route with preProcess', () => {
      const routeDefinition: RouteDefinition = {
        method: 'delete',
        path: '/preProcess-enabled',
        preProcess: () => {},
        process: () => {},
      };

      routing.addRoute(routeDefinition);

      expect(appMock.options).not.toHaveBeenCalled();
      expect(appMock.delete).toHaveBeenCalledWith(
        '/preProcess-enabled',
        routeDefinition.preProcess,
        routeDefinition.process
      );
    });

    it('handles a route with validate', () => {
      const validate = { body: { foo: 'bar' } };
      const routeDefinition: RouteDefinition = {
        method: 'put',
        path: '/validate-enabled',
        process: () => {},
        validate,
      };

      routing.addRoute(routeDefinition);

      expect(celebrateModule.celebrate).toHaveBeenCalledWith(validate, {
        stripUnknown: { arrays: false, objects: true },
        abortEarly: false,
      });
      expect(appMock.options).not.toHaveBeenCalled();
      expect(appMock.put).toHaveBeenCalledWith(
        '/validate-enabled',
        celebrateHandler,
        routeDefinition.process
      );
    });

    it('handles all the options', () => {
      const routeDefinition: RouteDefinition = {
        cors: { foo: 'bar' },
        method: 'get',
        path: '/all-options',
        preProcess: () => {},
        process: () => {},
        validate: { body: { foo: 'bar' } },
      };

      routing.addRoute(routeDefinition);

      expect(appMock.options).toHaveBeenCalledWith('/all-options', corsHandler);
      expect(appMock.get).toHaveBeenCalledWith(
        '/all-options',
        corsHandler,
        routeDefinition.preProcess,
        celebrateHandler,
        routeDefinition.process
      );
    });
  });

  describe('validationErrorHandler', () => {
    it('logs and delegates validation errors to celebrate', () => {
      const error = new Error('uh oh');
      const next = jest.fn();
      (
        celebrateModule.isCelebrateError as unknown as jest.Mock
      ).mockReturnValue(true);

      routing.validationErrorHandler(error, req, res, next);

      expect(loggerMock.error).toHaveBeenCalledWith('validation.failed', {
        err: error,
        method: req.method,
        path: req.url,
      });
      expect(next).not.toHaveBeenCalled();
      expect(errorHandler).toHaveBeenCalledWith(error, req, res, next);
      expect(Sentry.captureMessage).not.toHaveBeenCalled();
    });

    it('passes on other errors to the next error handler', () => {
      const error = new Error('uh oh');
      const next = jest.fn();

      routing.validationErrorHandler(error, req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(errorHandler).not.toHaveBeenCalled();
      expect(loggerMock.error).not.toHaveBeenCalled();
    });

    it('logs joi validation errors and reports them to sentry', () => {
      const error = new CelebrateError();
      const next = jest.fn();
      error.details.set('body', {
        name: 'ValidationError',
        isJoi: true,
        message: 'joi validation error',
        details: [{ message: 'joi error', path: [''], type: '' }],
      } as any);
      (
        celebrateModule.isCelebrateError as unknown as jest.Mock
      ).mockReturnValue(true);

      routing.validationErrorHandler(error, req, res, next);

      expect(loggerMock.error).toHaveBeenCalledTimes(2);
      expect(loggerMock.error).toHaveBeenCalledWith('joi.validationError', {
        err: error,
        joiErrors: 'joi validation error',
      });
      expect(Sentry.withScope).toHaveBeenCalledTimes(1);
      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Joi validation error',
        'error'
      );
      expect(errorHandler).toHaveBeenCalledWith(error, req, res, next);
    });
  });
});
