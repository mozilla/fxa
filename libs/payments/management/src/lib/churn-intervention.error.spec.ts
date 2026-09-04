/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { VError } from 'verror';
import {
  ChurnInterventionError,
  ChurnInterventionProductIdentifierMissingError,
  ChurnSubscriptionCustomerMismatchError,
} from './churn-intervention.error';

describe('ChurnInterventionError', () => {
  it('sets the name and message', () => {
    const error = new ChurnInterventionError('test message', { key: 'value' });
    expect(error.name).toBe('ChurnInterventionError');
    expect(error.message).toBe('test message');
  });

  it('preserves the cause when provided', () => {
    const cause = new Error('root cause');
    const error = new ChurnInterventionError('wrapped', {}, cause);
    expect(VError.cause(error)).toBe(cause);
  });
});

describe('ChurnInterventionProductIdentifierMissingError', () => {
  it('sets the expected name and message', () => {
    const error = new ChurnInterventionProductIdentifierMissingError();
    expect(error.name).toBe('ChurnInterventionProductIdentifierMissingError');
    expect(error.message).toBe(
      'Either stripeProductId or offeringApiIdentifier must be provided'
    );
  });

  it('is an instance of ChurnInterventionError', () => {
    const error = new ChurnInterventionProductIdentifierMissingError();
    expect(error).toBeInstanceOf(ChurnInterventionError);
  });
});

describe('ChurnSubscriptionCustomerMismatchError', () => {
  it('sets the expected name and message with info', () => {
    const error = new ChurnSubscriptionCustomerMismatchError(
      'uid_123',
      'cus_account',
      'cus_subscription',
      'sub_456'
    );
    expect(error.name).toBe('ChurnSubscriptionCustomerMismatchError');
    expect(error.message).toBe(
      'Subscription customer does not match account customer'
    );
  });

  it('is an instance of ChurnInterventionError', () => {
    const error = new ChurnSubscriptionCustomerMismatchError(
      'uid_123',
      'cus_account',
      'cus_subscription',
      'sub_456'
    );
    expect(error).toBeInstanceOf(ChurnInterventionError);
  });
});
