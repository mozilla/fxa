import { expect } from 'chai';

import { Plan, ProductMetadata } from '../../subscriptions/types';
import {
  DEFAULT_PRODUCT_DETAILS,
  metadataFromPlan,
  productDetailsFromPlan,
} from '../../subscriptions/metadata';

const NULL_METADATA = {
  productSet: null,
  productOrder: null,
  emailIconURL: null,
  webIconURL: null,
  upgradeCTA: null,
  downloadURL: null,
};

const PLAN: Plan = {
  plan_id: 'plan_8675309',
  product_id: 'prod_8675309',
  product_name: 'Example product',
  currency: 'usd',
  amount: 599,
  interval: 'month' as const,
  interval_count: 1,
};

describe('subscriptions/metadata', () => {
  describe('metadataFromPlan', () => {
    it('produces default null values', () => {
      expect(metadataFromPlan(PLAN)).to.deep.equal(NULL_METADATA);
    });

    it('extracts product metadata', () => {
      const product_metadata: ProductMetadata = {
        productSet: 'foo',
        productOrder: 1,
      };
      expect(metadataFromPlan({ ...PLAN, product_metadata })).to.deep.equal({
        ...NULL_METADATA,
        ...product_metadata,
      });
    });

    it('extracts plan metadata', () => {
      const plan_metadata: ProductMetadata = {
        productSet: 'foo',
        productOrder: 1,
      };
      expect(metadataFromPlan({ ...PLAN, plan_metadata })).to.deep.equal({
        ...NULL_METADATA,
        ...plan_metadata,
      });
    });

    it('overrides product metadata with plan metadata', () => {
      const product_metadata: ProductMetadata = {
        productSet: 'foo',
        productOrder: 1,
      };
      const plan_metadata: ProductMetadata = {
        productSet: 'bar',
      };
      expect(
        metadataFromPlan({ ...PLAN, plan_metadata, product_metadata })
      ).to.deep.equal({
        ...NULL_METADATA,
        productOrder: 1,
        productSet: 'bar',
      });
    });
  });

  describe('productDetailsFromPlan', () => {
    const plan = {
      ...PLAN,
      product_metadata: {
        productSet: 'foo',
        productOrder: '2',
        'product:ignoreme': 'Unknown name here',
        'product:subtitle': 'Great Full-device VPN',
        'product:details:3': 'Baz Connects 5 devices with one subscription',
        'product:details:1': 'Foo Device-level encryption',
        'product:details:2': 'Bar Servers in 30+ countries',
        'product:details:4': 'Quux Available for Windows, iOS and Android',
        'product:termsOfServiceURL': 'https://example.org/en-US/terms',
        'product:privacyNoticeURL': 'https://example.org/en-US/privacy',
        'product:termsOfServiceDownloadURL':
          'https://example.org/en-US/terms/download',
        'product:privacyNoticeDownloadURL':
          'https://example.org/en-US/privacy/download',
        'product:subtitle:xx-pirate': 'VPN fer yer full-device',
        'product:foobar:9:xx-pirate': 'what even is this',
        'product:details:4:xx-pirate': "Available fer Windows, iOS an' Android",
        'product:details:1:xx-pirate': 'Device-level encryption arr',
        'product:details:3:xx-pirate':
          "Connects 5 devices wit' one subscription",
        'product:details:2:xx-pirate': 'Servers is 30+ countries matey',
        'product:termsOfServiceURL:xx-pirate':
          'https://example.org/xx-pirate/terms',
        'product:privacyNoticeURL:xx-pirate':
          'https://example.org/xx-pirate/privacy',
        'product:termsOfServiceDownloadURL:xx-pirate':
          'https://example.org/xx-pirate/terms/download',
        'product:privacyNoticeDownloadURL:xx-pirate':
          'https://example.org/xx-pirate/privacy/download',
        'product:subtitle:xx-partial': 'Partial localization',
        'product:details:1:xx-partial': true,
        'product:termsOfServiceURL:xx-partial':
          'https://example.org/xx-partial/terms',
      },
    };

    it('extracts base details when metadata does not supply product details', () => {
      expect(productDetailsFromPlan(PLAN)).to.deep.equal(
        DEFAULT_PRODUCT_DETAILS
      );
    });

    it('extracts product details for default locale', () => {
      expect(productDetailsFromPlan(plan)).to.deep.equal({
        subtitle: 'Great Full-device VPN',
        details: [
          'Foo Device-level encryption',
          'Bar Servers in 30+ countries',
          'Baz Connects 5 devices with one subscription',
          'Quux Available for Windows, iOS and Android',
        ],
        termsOfServiceURL: 'https://example.org/en-US/terms',
        privacyNoticeURL: 'https://example.org/en-US/privacy',
        termsOfServiceDownloadURL: 'https://example.org/en-US/terms/download',
        privacyNoticeDownloadURL: 'https://example.org/en-US/privacy/download',
      });
    });

    it('extracts product details for xx-pirate locale', () => {
      expect(productDetailsFromPlan(plan, ['xx-pirate'])).to.deep.equal({
        subtitle: 'VPN fer yer full-device',
        details: [
          'Device-level encryption arr',
          'Servers is 30+ countries matey',
          "Connects 5 devices wit' one subscription",
          "Available fer Windows, iOS an' Android",
        ],
        termsOfServiceURL: 'https://example.org/xx-pirate/terms',
        privacyNoticeURL: 'https://example.org/xx-pirate/privacy',
        termsOfServiceDownloadURL:
          'https://example.org/xx-pirate/terms/download',
        privacyNoticeDownloadURL:
          'https://example.org/xx-pirate/privacy/download',
      });
    });

    it('extracts product details for xx-partial locale', () => {
      expect(productDetailsFromPlan(plan, ['xx-partial'])).to.deep.equal({
        subtitle: 'Partial localization',
        details: [
          'Foo Device-level encryption',
          'Bar Servers in 30+ countries',
          'Baz Connects 5 devices with one subscription',
          'Quux Available for Windows, iOS and Android',
        ],
        termsOfServiceURL: 'https://example.org/xx-partial/terms',
        privacyNoticeURL: 'https://example.org/en-US/privacy',
        termsOfServiceDownloadURL: 'https://example.org/en-US/terms/download',
        privacyNoticeDownloadURL: 'https://example.org/en-US/privacy/download',
      });
    });

    it('extracts product details for xx-unknown locale', () => {
      expect(productDetailsFromPlan(plan, ['xx-unknown'])).to.deep.equal({
        subtitle: 'Great Full-device VPN',
        details: [
          'Foo Device-level encryption',
          'Bar Servers in 30+ countries',
          'Baz Connects 5 devices with one subscription',
          'Quux Available for Windows, iOS and Android',
        ],
        termsOfServiceURL: 'https://example.org/en-US/terms',
        privacyNoticeURL: 'https://example.org/en-US/privacy',
        termsOfServiceDownloadURL: 'https://example.org/en-US/terms/download',
        privacyNoticeDownloadURL: 'https://example.org/en-US/privacy/download',
      });
    });
  });
});
