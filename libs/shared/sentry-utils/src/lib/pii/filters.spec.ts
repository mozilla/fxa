/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ErrorEvent } from '@sentry/core';
import { SQS } from 'aws-sdk';
import { IFilterAction, PiiData } from '../models/pii';
import {
  CommonPiiActions,
  FILTERED,
  PiiRegexFilter,
  TRUNCATED,
} from './filter-actions';
import { FilterBase, SentryPiiFilter, SqsMessageFilter } from './filters';
import { Logger } from '../sentry.types';

describe('pii-filters', () => {
  describe('SentryMessageFilter', () => {
    const sentryFilter = new SentryPiiFilter([
      CommonPiiActions.breadthFilter,
      CommonPiiActions.depthFilter,
      CommonPiiActions.urlUsernamePassword,
      CommonPiiActions.emailValues,
      CommonPiiActions.piiKeys,
      CommonPiiActions.tokenValues,
      CommonPiiActions.ipV4Values,
      CommonPiiActions.ipV6Values,
      new PiiRegexFilter(/foo/gi),
    ]);

    it('filters empty event', () => {
      let event: ErrorEvent = { type: undefined };
      event = sentryFilter.filter(event);
      expect(event).toEqual({ type: undefined });
    });

    it('filters event', () => {
      let event: ErrorEvent = {
        message: 'A foo message.',
        contexts: {
          ValidationError: {
            _original: {
              email: `foo@bar.com`,
            },
            details: [
              {
                context: {
                  key: 'email',
                  label: 'email',
                  name: '[undefined]',
                  regex: {},
                  value: 'none',
                },
                message: `foo@bar.com fails to match email pattern`,
                path: ['email'],
                type: 'string.pattern.base',
              },
            ],
            type: 'ValidationError',
          },
        },
        breadcrumbs: [
          {
            message: 'A foo breadcrumb',
            data: {
              first_name: 'foo',
              last_name: 'bar',
            },
          },
          {
            message: 'A fine message',
          },
        ],
        request: {
          url: 'http://me:123@foo.bar/?email=foxkey@mozilla.com&uid=12345678123456781234567812345678',
          query_string: {
            email: 'foo',
            uid: 'bar',
          },
          cookies: {
            user: 'foo:bar',
          },
          env: {
            key: '--foo',
          },
          headers: {
            foo: 'a foo header',
            bar: 'a foo bar bar header',
            'oidc-claim': 'claim1',
          },
          data: {
            info: {
              email: 'foxkeh@mozilla.com',
              uid: '12345678123456781234567812345678',
            },
            time: new Date(0).getTime(),
          },
        },
        exception: {
          values: [
            {
              value:
                'Foo bar! A user with email foxkeh@mozilla.clom and ip 127.0.0.1 encountered an err.',
            },
          ],
        },
        extra: {
          meta: {
            email: 'foo@bar.com',
          },
          foo: Array(51).fill('bar'),
          l1: {
            l2: {
              l3: {
                l4: {
                  l5: {
                    l6: {
                      l7: {
                        l8: {
                          l9: {
                            l10: 'bar',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        user: {
          meta: {
            email: 'foo@bar.com',
          },
          id: 'foo123',
          ip_address: '127.0.0.1',
          email: 'foo@bar.com',
          username: 'foo.bar',
        },
        type: undefined,
        spans: undefined, // Not testing, let's be careful not put PII in spans,
        measurements: undefined, // NA, just numbers
        debug_meta: undefined, // NA, image data
        sdkProcessingMetadata: undefined, // NA, not used
      };

      event = sentryFilter.filter(event);

      expect(event).toEqual({
        message: `A ${FILTERED} message.`,
        contexts: {
          ValidationError: {
            _original: {
              email: '[Filtered]',
            },
            details: [
              {
                context: {
                  key: 'email',
                  label: 'email',
                  name: '[undefined]',
                  regex: {},
                  value: 'none',
                },
                message: '[Filtered] fails to match email pattern',
                path: ['email'],
                type: 'string.pattern.base',
              },
            ],
            type: 'ValidationError',
          },
        },
        breadcrumbs: [
          {
            message: `A ${FILTERED} breadcrumb`,
            data: {
              first_name: FILTERED,
              last_name: 'bar',
            },
          },
          {
            message: 'A fine message',
          },
        ],
        request: {
          url: `http://${FILTERED}:${FILTERED}@${FILTERED}.bar/?email=${FILTERED}&uid=${FILTERED}`,
          query_string: {
            email: FILTERED,
            uid: FILTERED,
          },
          cookies: {
            user: FILTERED,
          },
          env: {
            key: `--${FILTERED}`,
          },
          headers: {
            foo: `a ${FILTERED} header`,
            bar: `a ${FILTERED} bar bar header`,
            'oidc-claim': `${FILTERED}`,
          },
          data: {
            info: {
              email: `${FILTERED}`,
              uid: `${FILTERED}`,
            },
            time: new Date(0).getTime(),
          },
        },
        exception: {
          values: [
            {
              value: `${FILTERED} bar! A user with email ${FILTERED} and ip ${FILTERED} encountered an err.`,
            },
          ],
        },
        extra: {
          meta: {
            email: FILTERED,
          },
          foo: [...Array(50).fill('bar'), `${TRUNCATED}:1`],
          l1: {
            l2: {
              l3: {
                l4: {
                  l5: {
                    l6: TRUNCATED,
                  },
                },
              },
            },
          },
        },
        user: {
          meta: {
            email: FILTERED,
          },
          id: `${FILTERED}123`,
          ip_address: FILTERED,
          email: FILTERED,
          username: FILTERED,
        },
        type: undefined,
        spans: undefined, // Not testing, let's be careful not put PII in spans,
        measurements: undefined, // NA, just numbers
        debug_meta: undefined, // NA, image data
        sdkProcessingMetadata: undefined, // NA, not used
      });
    });
  });

  describe('SqsMessageFilter', () => {
    const sqsFilter = new SqsMessageFilter([new PiiRegexFilter(/foo/gi)]);

    it('filters body', () => {
      let msg = { Body: 'A message with foo in it.' } as SQS.Message;
      msg = sqsFilter.filter(msg);

      expect(msg).toEqual({
        Body: `A message with ${FILTERED} in it.`,
      });
    });
  });

  describe('Deals with Bad Filter', () => {
    const mockLogger: Logger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };

    afterEach(() => {
      jest.restoreAllMocks();
    });

    class BadAction implements IFilterAction {
      execute<T extends PiiData>(
        val: T,
        depth?: number
      ): { val: T; exitPipeline: boolean } {
        throw new Error('Boom');
      }
    }

    class BadFilter extends FilterBase {
      constructor(logger: Logger) {
        super([new BadAction()], logger);
      }

      filter(data: any): any {
        return this.applyFilters(data);
      }
    }

    it('handles errors and logs them', () => {
      const badFilter = new BadFilter(mockLogger);
      badFilter.filter({ foo: 'bar' });
      expect(mockLogger.error).toBeCalled();
    });
  });

  describe('Short Circuits', () => {
    class ShortCircuit implements IFilterAction {
      execute<T extends PiiData>(val: T, depth?: number) {
        if (typeof val === 'string') {
          val = FILTERED as T;
        } else if (typeof val === 'object') {
          for (const key in val) {
            val[key] = FILTERED;
          }
        }
        return { val, exitPipeline: true };
      }
    }

    const shortCircuit = new ShortCircuit();
    const noAction = {
      execute: jest.fn(),
    };

    const sentryFilter = new SentryPiiFilter([
      shortCircuit,
      noAction as IFilterAction,
    ]);

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('shorts circuits', () => {
      // The fact this runs with out error, indicates badAction was never invoked
      const event = sentryFilter.filter({
        type: undefined,
        request: {
          url: 'http://foo.bar',
          query_string: {
            foo: 'bar',
          },
          headers: {
            foo: 'bar',
          },
          data: {
            info: {
              foo: 'bar',
            },
            time: new Date(0).getTime(),
          },
        },
      });
      expect(noAction.execute).toHaveBeenCalledTimes(0);
      expect(event).toBeDefined();
    });
  });
});
