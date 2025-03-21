import {
  StripeCustomer,
  StripePrice,
  StripePromotionCode,
} from '@fxa/payments/stripe';
import { ResultCart } from './cart.types';
import { SubscriptionEligibilityResult } from '@fxa/payments/eligibility';

export type PrePayStepsResult = Pick<ResultCart, 'version'> & {
  uid: string;
  customer: StripeCustomer;
  enableAutomaticTax: boolean;
  promotionCode?: StripePromotionCode;
  price: StripePrice;
  eligibility: SubscriptionEligibilityResult;
};
