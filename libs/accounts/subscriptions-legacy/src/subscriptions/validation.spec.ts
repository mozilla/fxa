/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  commaArray,
  subscriptionProductMetadataBaseValidator,
} from './validation';
import Joi from 'joi';

describe('subscriptions/validation', () => {
  describe('commaArray', () => {
    it('returns array from comma separated string', () => {
      const result = commaArray.validate('one,two,three');
      expect(result).toStrictEqual({ value: ['one', 'two', 'three'] });
    });

    it('returns array from single string', () => {
      const result = commaArray.validate('one');
      expect(result).toStrictEqual({ value: ['one'] });
    });

    it('returns undefined, and ValidationError', () => {
      const result = commaArray.validate(1);
      expect(result.value).toBe(undefined);
      expect(result.error?.message).toBe('"value" must be an array');
    });
  });

  describe('subscriptionProductMetadataBaseValidator', () => {
    const baseValidMetadata = {
      webIconURL: 'https://example.com/webicon',
      successActionButtonURL: 'https://example.com/successbutton',
      productSet: 'product-one',
      'product:termsOfServiceDownloadURL':
        'https://cdn.accounts.firefox.com/legal/termsdownload',
      'product:termsOfServiceURL': 'https://example.com/terms',
      'product:privacyNoticeURL': 'https://example.com/privacy',
    };
    it('validates - minimum required metadata', () => {
      const result =
        subscriptionProductMetadataBaseValidator.validate(baseValidMetadata);
      expect(result.error).toBeUndefined();
    });

    it('validates - with newsletter metadata', () => {
      const testMetadata = {
        ...baseValidMetadata,
        newsletterSlug: 'security-privacy-news,hubs,mdnplus',
        newsletterLabelTextCode: 'mozilla',
      };
      const result =
        subscriptionProductMetadataBaseValidator.validate(testMetadata);
      expect(result.error).toBeUndefined();
    });

    it('does not validate - with unsupported newsletterSlug', () => {
      const testMetadata = {
        ...baseValidMetadata,
        newsletterSlug: 'security-privacy-news,something-random',
      };
      const result =
        subscriptionProductMetadataBaseValidator.validate(testMetadata);
      expect(result.error).toBeInstanceOf(Joi.ValidationError);
    });

    it('does not validate - with unsupported newsletterLabelTextCode', () => {
      const testMetadata = {
        ...baseValidMetadata,
        newsletterLabelTextCode: 'notsupported',
      };
      const result =
        subscriptionProductMetadataBaseValidator.validate(testMetadata);
      expect(result.error).toBeInstanceOf(Joi.ValidationError);
    });
  });
});
