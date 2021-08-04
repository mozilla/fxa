/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
    it('resolves to undefined on success', async () => {
      await handleNewsletterSignup();
      await expect(handleNewsletterSignup()).resolves.toBe(undefined);
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
