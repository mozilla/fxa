import {
  BaseCartDTO,
  FromPrice,
  Invoice,
  PaymentInfo,
  ResultCart,
} from '@fxa/payments/cart';
import { CartEligibilityStatus, CartState } from '@fxa/shared/db/mysql/account';

export type UpgradeCartDTO = BaseCartDTO & {
  state: CartState;
  eligibilityStatus: CartEligibilityStatus.UPGRADE;
  fromOfferingConfigId: string;
  fromPrice: FromPrice;
};
