/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Message } from '@aws-sdk/client-sqs';
import { IFilterAction, PiiData } from '../models/pii';
import { FILTERED, PiiRegexFilter } from './filter-actions';
import { FilterBase, SqsMessageFilter } from './filters';
import { Logger } from '../sentry.types';

describe('pii-filters', () => {
  describe('SqsMessageFilter', () => {
    const sqsFilter = new SqsMessageFilter([new PiiRegexFilter(/foo/gi)]);

    it('filters body', () => {
      let msg = { Body: 'A message with foo in it.' } as Message;
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
});
