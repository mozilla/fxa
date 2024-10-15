import {
  StripeCustomer,
  StripePrice,
  StripePromotionCode,
} from '@fxa/payments/stripe';
import { ResultCart } from './cart.types';

export type PrePayStepsResult = Pick<ResultCart, 'version' | 'email'> & {
  uid: string;
  customer: StripeCustomer;
  enableAutomaticTax: boolean;
  promotionCode?: StripePromotionCode;
  price: StripePrice;
};
