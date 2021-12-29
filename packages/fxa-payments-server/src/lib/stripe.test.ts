/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

jest.mock('./account', () => ({
  handlePasswordlessSignUp: jest.fn(),
}));
jest.mock('./apiClient');

import * as apiClient from './apiClient';
import { FXA_SIGNUP_ERROR, handlePasswordlessSignUp } from './account';
import { handlePasswordlessSubscription, localeToStripeLocale } from './stripe';
import { NEW_CUSTOMER, PLAN } from './mock-data';

const stripeOverride = {
  createPaymentMethod: jest.fn().mockResolvedValue({ paymentMethod: {} }),
  confirmCardPayment: jest.fn().mockResolvedValue({}),
};
const apiClientOverrides = {
  apiCreateCustomer: jest.fn().mockResolvedValue(NEW_CUSTOMER),
  apiCreateSubscriptionWithPaymentMethod: jest.fn().mockResolvedValue({
    latest_invoice: {
      payment_intent: {
        status: 'succeeded',
      },
    },
  }),
  apiRetryInvoice: jest.fn().mockResolvedValue({
    payment_intent: {
      status: 'succeeded',
    },
  }),
  apiDetachFailedPaymentMethod: jest.fn().mockResolvedValue({}),
};

// handleSubscriptionPayment and handlePaymentIntent are tested as part of SubscriptionCreate

// At the time of writing, there is no UI component that uses
// handlePasswordlessSubscription; once we have that implementation, we should
// test handlePasswordlessSubscription in the same fashion that we test
// handleSubscriptionPayment.
// #TODO https://github.com/mozilla/fxa/issues/9358
describe('handlePasswordlessSubscription', () => {
  const email = 'testo@example.com';
  const clientId = 'thebestprogram';
  const noop = () => {};

  beforeEach(() => {
    (handlePasswordlessSignUp as jest.Mock).mockClear();
  });

  it('calls handlePasswordlessSignUp then handleSubscriptionPayment on success', async () => {
    const onFailure = jest.fn();

    (handlePasswordlessSignUp as jest.Mock).mockResolvedValue({});
    await handlePasswordlessSubscription({
      email,
      clientId,
      stripe: stripeOverride,
      name: 'BMO',
      card: null,
      idempotencyKey: 'dontrepeat',
      selectedPlan: PLAN,
      customer: null,
      retryStatus: undefined,
      ...apiClientOverrides,
      promoCode: undefined,
      onFailure,
      onRetry: noop,
      onSuccess: noop,
    });

    expect(handlePasswordlessSignUp).toBeCalledWith({ email, clientId });
    expect(onFailure).not.toHaveBeenCalled();
  });

  it('calls the onFailure callback on error', async () => {
    const onFailure = jest.fn();

    (handlePasswordlessSignUp as jest.Mock).mockRejectedValue(FXA_SIGNUP_ERROR);
    await handlePasswordlessSubscription({
      email,
      clientId,
      stripe: stripeOverride,
      name: 'BMO',
      card: null,
      idempotencyKey: 'dontrepeat',
      selectedPlan: PLAN,
      customer: null,
      retryStatus: undefined,
      ...apiClientOverrides,
      promoCode: undefined,
      onFailure,
      onRetry: noop,
      onSuccess: noop,
    });

    expect(handlePasswordlessSignUp).toBeCalledWith({ email, clientId });
    expect(onFailure).toHaveBeenCalledWith(FXA_SIGNUP_ERROR);
  });
});

describe('localeToStripeLocale', () => {
  it('handles known Stripe locales as expected', () => {
    expect(localeToStripeLocale('ar')).toEqual('ar');
  });
  it('handles locales with subtags as expected', () => {
    expect(localeToStripeLocale('en-GB')).toEqual('en');
  });
  it('handles empty locales as "auto"', () => {
    expect(localeToStripeLocale()).toEqual('auto');
  });
  it('handles unknown Stripe locales as "auto"', () => {
    expect(localeToStripeLocale('xx-pirate')).toEqual('auto');
  });
});
