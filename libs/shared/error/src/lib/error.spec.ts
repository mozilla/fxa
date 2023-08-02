/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { faker } from '@faker-js/faker';
import { MultiError, VError } from 'verror';

import {
  NVPErrorFactory,
  NVPErrorResponseFactory,
} from '../../../../payments/paypal/src/lib/factories';
import {
  ContentfulClientError,
  PayPalClientError,
  PayPalNVPError,
  TypeError,
} from './error';

describe('Error', () => {
  const message = faker.word.words();

  describe('ContentfulClientError', () => {
    it('should have the expected properties', () => {
      const error = new ContentfulClientError(message);
      expect(error.name).toEqual('ContentfulClientError');
      expect(error.message).toEqual(message);
      expect(error).toBeInstanceOf(VError);
    });
  });

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
      expect(error.raw).toEqual(raw);
      expect(error.data).toStrictEqual(data);
    });
  });

  describe('TypeError', () => {
    const error = new TypeError(message);
    it('should have the expected properties', () => {
      expect(error.name).toEqual('TypeError');
      expect(error.message).toEqual(message);
      expect(error).toBeInstanceOf(VError);
    });
  });
});
