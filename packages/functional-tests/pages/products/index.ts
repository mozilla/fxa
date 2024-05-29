/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from '../layout';
import { PaymentInformationPage } from './components/paymentInformation';

export enum Coupon {
  // 'autoexpired' coupon is an expired coupon for a 6mo plan
  AUTO_EXPIRED = 'autoexpired',
  // 'autoinvalid' coupon is an invalid coupon for a 6mo plan, but valid for a 12mo plan
  AUTO_INVALID = 'autoinvalid',
  // 'auto10pforever' is a 10% forever discount coupon for a 6mo plan
  AUTO_10_PERCENT_FOREVER = 'auto10pforever',
  // 'auto50ponetime' is a one time 50% discount coupon for a 12mo plan
  AUTO_50_PERCENT_ONE_TIME = 'auto50ponetime',
}

export class SubscribePage extends BaseLayout {
  readonly path = '';

  get setupSubscriptionFormHeading() {
    return this.page.getByRole('heading', { name: 'Set up your subscription' });
  }

  get signinLink() {
    return this.page.getByRole('link', { name: 'Sign in' });
  }

  get emailTextbox() {
    return this.page.getByTestId('new-user-enter-email');
  }

  get confirmEmailTextbox() {
    return this.page.getByTestId('new-user-confirm-email');
  }

  get paymentInformation() {
    return new PaymentInformationPage(this.page);
  }

  get promoCodeAppliedHeading() {
    return this.page.getByRole('heading', { name: 'Promo Code Applied' });
  }

  get confirmPaymentCheckbox() {
    return this.page.getByTestId('confirm');
  }

  get promoCodeHeading() {
    return this.page
      .getByTestId('coupon-component')
      .getByRole('heading', { name: 'Promo Code' });
  }

  get couponTextbox() {
    return this.page.getByTestId('coupon-input');
  }

  get addCouponButton() {
    return this.page.getByTestId('coupon-button');
  }

  get couponErrorMessage() {
    return this.page.getByTestId('coupon-error');
  }

  get couponSuccessMessage() {
    return this.page.getByTestId('coupon-success');
  }

  get removeCouponButton() {
    return this.page.getByTestId('coupon-remove-button');
  }

  get listPrice() {
    return this.page.getByText('List Price', { exact: true });
  }

  get promoCode() {
    return this.page
      .getByTestId('plan-details-component')
      .getByText('Promo Code');
  }

  get totalPrice() {
    return this.page.getByTestId('total-price');
  }

  get subscriptionErrorHeading() {
    return this.page.getByRole('heading', {
      name: /Error confirming subscription/,
    });
  }

  get tryAgainButton() {
    return this.page.getByTestId('retry-link');
  }

  get subscriptionConfirmationHeading() {
    return this.page.getByRole('heading', {
      name: 'Subscription confirmation',
    });
  }

  get planUpgradeDetails() {
    return this.page.getByTestId('plan-upgrade-details-component');
  }

  async clickPayPal() {
    // Start waiting for popup before clicking
    const paypalPopupPromise = this.page.waitForEvent('popup');
    await this.page.getByTestId('paypal-button-container').click();
    const paypalPopup = await paypalPopupPromise;

    // Wait for the popup to load
    await paypalPopup.waitForLoadState();

    return paypalPopup;
  }

  async addCouponCode(coupon: Coupon) {
    await this.couponTextbox.fill(coupon);
    await this.addCouponButton.click();
  }
}
