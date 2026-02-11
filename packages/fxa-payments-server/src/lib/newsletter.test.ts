/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ProductMetadata } from 'fxa-shared/subscriptions/types';
import { apiSignupForNewsletter } from './apiClient';
import {
  FXA_NEWSLETTER_SIGNUP_ERROR,
  handleNewsletterSignup,
} from './newsletter';
import sentry from './sentry';

jest.mock('./apiClient', () => ({
  apiSignupForNewsletter: jest.fn().mockResolvedValue({}),
}));
jest.mock('./sentry', () => ({
  __esModule: true,
  default: { captureException: jest.fn() },
}));

beforeEach(() => {
  (apiSignupForNewsletter as jest.Mock).mockClear();
});

describe('lib/newsletter', () => {
  describe('handleNewsletterSignup', () => {
    it('resolves to undefined on success with default newsletter slug', async () => {
      await expect(handleNewsletterSignup()).resolves.toBe(undefined);
      expect(apiSignupForNewsletter).toHaveBeenCalledWith({
        newsletters: ['mozilla-and-you', 'mozilla-accounts'],
      });
    });

    it('resolves to undefined on success with one newsletter slug defined in product metadata', async () => {
      const productMetadata = {
        newsletterSlug: 'security-privacy-news',
      } as ProductMetadata;
      await expect(handleNewsletterSignup(productMetadata)).resolves.toBe(
        undefined
      );
      expect(apiSignupForNewsletter).toHaveBeenCalledWith({
        newsletters: ['security-privacy-news'],
      });
    });

    it('resolves to undefined on success with multiple newsletter slugs defined in product metadata', async () => {
      const productMetadata = {
        newsletterSlug: 'security-privacy-news,mdnplus',
      } as ProductMetadata;
      await expect(handleNewsletterSignup(productMetadata)).resolves.toBe(
        undefined
      );
      expect(apiSignupForNewsletter).toHaveBeenCalledWith({
        newsletters: ['security-privacy-news', 'mdnplus'],
      });
    });

    it('throws an error on failure', async () => {
      (apiSignupForNewsletter as jest.Mock)
        .mockReset()
        .mockRejectedValue(FXA_NEWSLETTER_SIGNUP_ERROR);
      await expect(handleNewsletterSignup()).rejects.toBe(
        FXA_NEWSLETTER_SIGNUP_ERROR
      );
      expect(sentry.captureException).toHaveBeenCalledWith(
        FXA_NEWSLETTER_SIGNUP_ERROR
      );
    });
  });
});
