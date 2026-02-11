import 'chai';
import { assert } from 'chai';
import {
  commaArray,
  subscriptionProductMetadataBaseValidator,
} from '../../subscriptions/validation';
import Joi from 'joi';

describe('subscriptions/validation', () => {
  describe('commaArray', () => {
    it('returns array from comma separated string', () => {
      const result = commaArray.validate('one,two,three');
      assert.deepEqual(result, { value: ['one', 'two', 'three'] });
    });

    it('returns array from single string', () => {
      const result = commaArray.validate('one');
      assert.deepEqual(result, { value: ['one'] });
    });

    it('returns undefined, and ValidationError', () => {
      const result = commaArray.validate(1);
      assert.equal(result.value, undefined);
      assert.equal(result.error.message, '"value" must be an array');
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
      assert.isUndefined(result.error);
    });

    it('validates - with newsletter metadata', () => {
      const testMetadata = {
        ...baseValidMetadata,
        newsletterSlug: 'security-privacy-news,hubs,mdnplus',
        newsletterLabelTextCode: 'mozilla',
      };
      const result =
        subscriptionProductMetadataBaseValidator.validate(testMetadata);
      assert.isUndefined(result.error);
    });

    it('does not validate - with unsupported newsletterSlug', () => {
      const testMetadata = {
        ...baseValidMetadata,
        newsletterSlug: 'security-privacy-news,something-random',
      };
      const result =
        subscriptionProductMetadataBaseValidator.validate(testMetadata);
      assert.instanceOf(result.error, Joi.ValidationError);
    });

    it('does not validate - with unsupported newsletterLabelTextCode', () => {
      const testMetadata = {
        ...baseValidMetadata,
        newsletterLabelTextCode: 'notsupported',
      };
      const result =
        subscriptionProductMetadataBaseValidator.validate(testMetadata);
      assert.instanceOf(result.error, Joi.ValidationError);
    });
  });
});
