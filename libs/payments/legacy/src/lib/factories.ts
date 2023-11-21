import { StripeMetadataWithContentful } from './types';

export const StripeMetadataWithContentfulFactory = (
  override?: Partial<StripeMetadataWithContentful>
): StripeMetadataWithContentful => ({
  ...override,
});
