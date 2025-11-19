/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CancelInterstitialOfferResultFactory,
  CancelInterstitialOfferFactory,
} from './factories';

import * as Sentry from '@sentry/node';
import { CancelInterstitialOfferUtil } from './util';

jest.mock('@sentry/node', () => ({
  captureMessage: jest.fn(),
}));

describe('CancelInterstitialOfferUtil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a util from response', () => {
    const result = CancelInterstitialOfferResultFactory();
    const util = new CancelInterstitialOfferUtil(result);
    expect(util).toBeDefined();
    expect(util.cancelInterstitialOffer.cancelInterstitialOffers).toHaveLength(
      1
    );
  });

  describe('getTransformedResult', () => {
    let util: CancelInterstitialOfferUtil;

    beforeEach(() => {
      const result = CancelInterstitialOfferResultFactory();
      util = new CancelInterstitialOfferUtil(result);
    });

    it('should transform cancel interstitial offer', () => {
      const transformed = util.getTransformedResult();
      expect(transformed).toBeDefined();
      expect(Array.isArray(transformed.modalMessage)).toBe(true);
      expect(transformed.offeringApiIdentifier).toBeDefined();
      expect(transformed.offering.stripeProductId).toBeDefined();
    });

    it('should capture sentry message if more than one cancel interstitial offer is returned', () => {
      const result = CancelInterstitialOfferResultFactory({
        cancelInterstitialOffers: [
          CancelInterstitialOfferFactory(),
          CancelInterstitialOfferFactory(),
        ],
      });
      const util = new CancelInterstitialOfferUtil(result);
      util.getTransformedResult();

      expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
    });

    it('should split modalMessage into an array', () => {
      const rawModalMessage =
        'This is line 1 of the modal message.\nThis is line 2 of the modal message.\nThis is line 3 of the modal message.';
      const result = CancelInterstitialOfferResultFactory({
        cancelInterstitialOffers: [
          CancelInterstitialOfferFactory({
            modalMessage: rawModalMessage,
          }),
        ],
      });
      const util = new CancelInterstitialOfferUtil(result);
      const transformed = util.getTransformedResult();

      expect(transformed.modalMessage).toEqual([
        'This is line 1 of the modal message.',
        'This is line 2 of the modal message.',
        'This is line 3 of the modal message.',
      ]);
    });
  });
});
