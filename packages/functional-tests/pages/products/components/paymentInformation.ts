/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Page } from '@playwright/test';

export type CreditCard = {
  name: string;
  number: string;
  expirationDate: string;
  cvc: string;
  zip: string;
};

export class PaymentInformationPage {
  constructor(readonly page: Page) {}

  get fullNameTextbox() {
    return this.page.getByTestId('name');
  }

  get creditCardNumber() {
    return this.page
      .frame({ url: /elements-inner-card/ })
      ?.getByPlaceholder('Card number');
  }

  get creditCardExpirationDate() {
    return this.page
      .frame({ url: /elements-inner-card/ })
      ?.getByPlaceholder('MM / YY');
  }

  get creditCardCVC() {
    return this.page
      .frame({ url: /elements-inner-card/ })
      ?.getByPlaceholder('CVC');
  }

  get creditCardZIP() {
    return this.page
      .frame({ url: /elements-inner-card/ })
      ?.getByPlaceholder('ZIP');
  }

  get updateButton() {
    return this.page.getByTestId('submit');
  }

  get cardInfoAndLastFour() {
    return this.page.getByTestId('card-logo-and-last-four');
  }

  async fillOutCreditCardInfo(creditCard: CreditCard) {
    await this.fullNameTextbox.fill(creditCard.name);
    await this.creditCardNumber?.fill(creditCard.number);
    await this.creditCardExpirationDate?.fill(creditCard.expirationDate);
    await this.creditCardCVC?.fill(creditCard.cvc);
    await this.creditCardZIP?.fill(creditCard.zip);
  }

  async clickPayNow() {
    // Start waiting for response before clicking
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        /\/mozilla-subscriptions\/customer\/billing-and-subscriptions$|static\/media\/error/.test(
          response.request().url()
        )
    );
    await this.page.getByTestId('submit').click();
    await responsePromise;
  }
}
