import { Plan, ProductMetadata } from './types';

import { metadataFromPlan } from './utils';

describe('metadataFromPlan', () => {
  it('produces default null values', () => {
    expect(metadataFromPlan(PLAN)).toEqual(NULL_METADATA);
  });

  it('extracts product metadata', () => {
    const product_metadata: ProductMetadata = {
      productSet: 'foo',
      productOrder: 1,
    };
    expect(metadataFromPlan({ ...PLAN, product_metadata })).toEqual({
      ...NULL_METADATA,
      ...product_metadata,
    });
  });

  it('extracts plan metadata', () => {
    const plan_metadata: ProductMetadata = {
      productSet: 'foo',
      productOrder: 1,
    };
    expect(metadataFromPlan({ ...PLAN, plan_metadata })).toEqual({
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
    ).toEqual({
      ...NULL_METADATA,
      productOrder: 1,
      productSet: 'bar',
    });
  });
});

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
  interval: 'monthly',
};
