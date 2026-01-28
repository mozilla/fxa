/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ErrorEvent } from '@sentry/core';
import { Message } from '@aws-sdk/client-sqs';
import { expect } from 'chai';
import sinon from 'sinon';

import { ILogger } from '../../log';
import { IFilterAction, PiiData } from '../../sentry/models/pii';
import {
  CommonPiiActions,
  FILTERED,
  PiiRegexFilter,
  TRUNCATED,
} from '../../sentry/pii-filter-actions';
import { FilterBase, SqsMessageFilter } from '../../sentry/pii-filters';

describe('pii-filters', () => {
  describe('SqsMessageFilter', () => {
    const sqsFilter = new SqsMessageFilter([new PiiRegexFilter(/foo/gi)]);

    it('filters body', () => {
      let msg = { Body: 'A message with foo in it.' } as Message;
      msg = sqsFilter.filter(msg);

      expect(msg).to.deep.equal({
        Body: `A message with ${FILTERED} in it.`,
      });
    });
  });

  describe('Deals with Bad Filter', () => {
    let mockLogger = <ILogger>{
      error: () => {},
    };
    let sandbox = sinon.createSandbox();

    afterEach(() => {
      sandbox.restore();
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
      constructor(logger: ILogger) {
        super([new BadAction()], logger);
      }

      filter(data: any): any {
        return this.applyFilters(data);
      }
    }

    it('handles errors and logs them', () => {
      const errorStub = sandbox.stub(mockLogger, 'error');
      const badFilter = new BadFilter(mockLogger);
      badFilter.filter({ foo: 'bar' });
      expect(errorStub.called).to.be.true;
    });
  });
});
