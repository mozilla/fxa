import { Plan, ProductMetadata } from './types';

// Support some default null values for product / plan metadata and
// allow plan metadata to override product metadata
export const metadataFromPlan = (plan: Plan): ProductMetadata => ({
  productSet: null,
  productOrder: null,
  emailIconURL: null,
  webIconURL: null,
  upgradeCTA: null,
  downloadURL: null,
  ...plan.product_metadata,
  ...plan.plan_metadata,
});
