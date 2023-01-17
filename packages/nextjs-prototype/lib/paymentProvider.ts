export const PaymentProviders = {
  stripe: 'stripe',
  paypal: 'paypal',
  none: 'not_chosen',
} as const;

type PaymentProvidersType = typeof PaymentProviders;
export type PaymentProvider = PaymentProvidersType[keyof PaymentProvidersType];

export function isStripe(provider: PaymentProvider | undefined): boolean {
  return provider === 'stripe';
}

export function isPaypal(provider: PaymentProvider | undefined): boolean {
  return provider === 'paypal';
}
