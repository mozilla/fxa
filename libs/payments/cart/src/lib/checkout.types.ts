import {
  StripeCustomer,
  StripePrice,
  StripePromotionCode,
} from '@fxa/payments/stripe';
import { ResultCart } from './cart.types';
import { SubscriptionEligibilityResult } from '@fxa/payments/eligibility';
import { FreeTrial } from '@fxa/shared/cms';

export type PrePayStepsResult = Pick<ResultCart, 'version'> & {
  uid: string;
  accountCreatedAt: number;
  customer: StripeCustomer;
  enableAutomaticTax: boolean;
  promotionCode?: StripePromotionCode;
  price: StripePrice;
  eligibility: SubscriptionEligibilityResult;
  freeTrial: FreeTrial | null;
};

export type SubscriptionAttributionParams = {
  utm_campaign: string;
  utm_content: string;
  utm_medium: string;
  utm_source: string;
  utm_term: string;
  session_flow_id: string;
  session_entrypoint: string;
  session_entrypoint_experiment: string;
  session_entrypoint_variation: string;
};
