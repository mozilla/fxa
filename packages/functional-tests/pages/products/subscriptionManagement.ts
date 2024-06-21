/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from '@playwright/test';
import { BaseLayout } from '../layout';
import { PaymentInformationPage } from './components/paymentInformation';

export class SubscriptionManagementPage extends BaseLayout {
  readonly path = '/subscription';

  get subscriptiontHeading() {
    return this.page.getByRole('heading', { name: 'Subscriptions' });
  }

  get contactsupportButton() {
    return this.page.getByTestId('contact-support-button');
  }

  get ChangePaymentInformationButton() {
    return this.page.getByTestId('reveal-payment-update-button');
  }

  get paymentInformation() {
    return new PaymentInformationPage(this.page);
  }

  get revealCancelSubscriptionButton() {
    return this.page.getByTestId('reveal-cancel-subscription-button');
  }

  get cancelSubscriptionHeading() {
    return this.page.getByRole('heading', { name: 'Cancel Subscription' });
  }

  get cancelSubscriptionCheckbox() {
    return this.page.getByTestId('confirm-cancel-subscription-checkbox');
  }

  get cancelSubscriptionButton() {
    return this.page.getByTestId('cancel-subscription-button');
  }

  get dialogDismissHeading() {
    return this.page.getByTestId('cancellation-message-title');
  }

  get dialogDismissButton() {
    return this.page.getByTestId('dialog-dismiss');
  }

  get reactivateSubscriptionButton() {
    return this.page.getByTestId('reactivate-subscription-button');
  }

  get reactivateSubscriptionDialogHeading() {
    return this.page.getByRole('heading', { name: /^Want to keep using/ });
  }

  get reactivateSubscriptionConfirmButton() {
    return this.page.getByTestId('reactivate-subscription-confirm-button');
  }

  get reactivateSubscriptionSuccessHeading() {
    return this.page.getByTestId('reactivate-subscription-success');
  }

  get reactivateSubscriptionSuccessButton() {
    return this.page.getByTestId('reactivate-subscription-success-button');
  }

  get subscriptionDetails() {
    return this.page.getByTestId('subscription-item');
  }

  get priceDetailsStandalone() {
    return this.page.getByTestId('price-details-standalone');
  }

  async cancelSubscription() {
    await this.revealCancelSubscriptionButton.click();

    await expect(this.cancelSubscriptionHeading).toBeVisible();

    await this.cancelSubscriptionCheckbox.check();
    await this.cancelSubscriptionButton.click();

    await expect(this.dialogDismissHeading).toBeVisible();

    await this.dialogDismissButton.click();
  }

  async resubscribe() {
    await this.reactivateSubscriptionButton.click();

    await expect(this.reactivateSubscriptionDialogHeading).toBeVisible();

    await this.reactivateSubscriptionConfirmButton.click();

    await expect(this.reactivateSubscriptionSuccessHeading).toBeVisible();

    await this.reactivateSubscriptionSuccessButton.click();
  }
}
