/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CartErrorReasonId } from '@fxa/shared/db/mysql/account';
import { getErrorFtlInfo } from './getErrorFtlInfo';
import type { CheckoutParams } from './types';

const params: CheckoutParams = {
  locale: 'en',
  offeringId: 'vpn',
  interval: 'monthly',
  cartId: 'cart-123',
};

const config = {
  contentServerUrl: 'https://accounts.example.com',
  supportUrl: 'https://support.example.com',
};

const landingUrl = '/en/vpn/monthly/landing';

describe('getErrorFtlInfo', () => {
  describe('payment failure errors show retry button pointing to landing', () => {
    it.each([
      [
        CartErrorReasonId.INTENT_FAILED_CARD_DECLINED,
        'intent-card-error',
        'Try again',
      ],
      [
        CartErrorReasonId.INTENT_FAILED_CARD_EXPIRED,
        'intent-expired-card-error',
        'Try again',
      ],
      [
        CartErrorReasonId.INTENT_FAILED_INSUFFICIENT_FUNDS,
        'intent-payment-error-insufficient-funds',
        'Try again',
      ],
      [
        CartErrorReasonId.INTENT_FAILED_GET_IN_TOUCH,
        'intent-payment-error-get-in-touch',
        'Try again',
      ],
      [
        CartErrorReasonId.INTENT_FAILED_TRY_AGAIN,
        'intent-payment-error-try-again',
        'Try again',
      ],
      [
        CartErrorReasonId.INTENT_FAILED_GENERIC,
        'intent-payment-error-generic',
        'Try again',
      ],
    ])(
      'returns retry URL for %s',
      (errorReasonId, expectedMessageFtl, expectedButtonLabel) => {
        const result = getErrorFtlInfo(errorReasonId, params, config);
        expect(result).toEqual({
          buttonFtl: 'next-payment-error-retry-button',
          buttonLabel: expectedButtonLabel,
          buttonUrl: landingUrl,
          message: expect.any(String),
          messageFtl: expectedMessageFtl,
        });
      }
    );
  });

  describe('eligibility errors', () => {
    it('returns support URL for downgrade', () => {
      const result = getErrorFtlInfo(
        CartErrorReasonId.CART_ELIGIBILITY_STATUS_DOWNGRADE,
        params,
        config
      );
      expect(result.buttonUrl).toEqual('https://support.example.com');
      expect(result.messageFtl).toEqual('checkout-error-contact-support');
    });

    it('returns support URL for invalid eligibility', () => {
      const result = getErrorFtlInfo(
        CartErrorReasonId.CART_ELIGIBILITY_STATUS_INVALID,
        params,
        config
      );
      expect(result.buttonUrl).toEqual('https://support.example.com');
      expect(result.messageFtl).toEqual('checkout-error-not-eligible');
    });

    it('returns subscription management URL for duplicate subscription', () => {
      const result = getErrorFtlInfo(
        CartErrorReasonId.CART_ELIGIBILITY_STATUS_SAME,
        params,
        config
      );
      expect(result.buttonUrl).toEqual('/subscriptions/landing');
      expect(result.messageFtl).toEqual('checkout-error-already-subscribed');
    });
  });

  describe('retry errors include query params when present', () => {
    it('appends search params to retry URL', () => {
      const result = getErrorFtlInfo(
        CartErrorReasonId.INTENT_FAILED_CARD_DECLINED,
        params,
        config,
        { utm_source: 'test' }
      );
      expect(result.buttonUrl).toEqual(
        '/en/vpn/monthly/landing?utm_source=test'
      );
    });

    it('appends search params to subscription management URL', () => {
      const result = getErrorFtlInfo(
        CartErrorReasonId.CART_ELIGIBILITY_STATUS_SAME,
        params,
        config,
        { utm_source: 'test' }
      );
      expect(result.buttonUrl).toEqual(
        '/subscriptions/landing?utm_source=test'
      );
    });
  });

  it('returns generic retry for unknown error reason', () => {
    const result = getErrorFtlInfo(null, params, config);
    expect(result.buttonUrl).toEqual(landingUrl);
    expect(result.buttonLabel).toEqual('Try again');
    expect(result.messageFtl).toEqual('next-basic-error-message');
  });
});
