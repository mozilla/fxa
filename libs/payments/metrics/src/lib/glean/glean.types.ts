/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ResultCart } from '@fxa/payments/cart';

type CheckoutType = 'with-accounts' | 'without-accounts';

export type CommonMetrics = {
  ipAddress: string;
  deviceType: string;
  userAgent: string;
  params: Record<string, string>;
  searchParams: Record<string, string>;
};

export type CartMetrics = Partial<
  Pick<ResultCart, 'uid' | 'errorReasonId' | 'couponCode'>
> & {
  //TODO - Replace on completion of FXA-7584 and pick from ResultCart
  currency: string;
};

export type FxaPaySetupMetrics = CommonMetrics & CartMetrics;

export type FxaPaySetupViewMetrics = FxaPaySetupMetrics & {
  checkoutType: CheckoutType;
};

export type GleanEvents = {
  fxaPaySetupView: FxaPaySetupViewMetrics;
};

export type CmsMetricsData = {
  productId: string;
  priceId: string;
};
