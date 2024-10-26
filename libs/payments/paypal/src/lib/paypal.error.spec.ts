/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { faker } from '@faker-js/faker';
import { MultiError, VError } from 'verror';

import { NVPErrorFactory, NVPErrorResponseFactory } from './factories';
import { PayPalClientError, PayPalNVPError } from './paypal.error';

describe('PayPal Errors', () => {
  const message = faker.word.words();

  describe('PayPalClientError', () => {
    const raw = faker.word.words();
    const data = NVPErrorResponseFactory({
      L: [NVPErrorFactory()],
    });

    it('should have the expected properties', () => {
      const multiErrorMessage = `first of 1 error: ${message}`;
      const nvpError = new PayPalNVPError(raw, data, { message });
      const error = new PayPalClientError([nvpError], raw, data);
      expect(error.name).toEqual('PayPalClientError');
      expect(error.message).toEqual(multiErrorMessage);
      expect(error).toBeInstanceOf(MultiError);
      expect(error.raw).toEqual(raw);
      expect(error.data).toStrictEqual(data);
    });
  });

  describe('PayPalNVPError', () => {
    const raw = faker.word.words();
    const data = NVPErrorResponseFactory({
      L: [NVPErrorFactory()],
    });

    it('should have the expected properties', () => {
      const error = new PayPalNVPError(raw, data, { message });
      expect(error.name).toEqual('PayPalNVPError');
      expect(error.message).toEqual(message);
      expect(error).toBeInstanceOf(VError);
      expect(VError.info(error).raw).toEqual(raw);
      expect(VError.info(error).data).toStrictEqual(data);
    });
  });
});
