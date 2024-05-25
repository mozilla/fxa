/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { expect } from '@playwright/test';
import { BaseLayout } from '../layout';

export enum App {
  Desktop = 'Desktop',
  Mobile = 'Mobile',
}

export enum Topic {
  PAYMENT_AND_BILLING = 'Payment & billing',
  ACCOUNT_ISSUES = 'Account issues',
  TECHNICAL_ISSUES = 'Technical issues',
  PROVIDE_FEEDBACK_OR_REQUEST_FEATURES = 'Provide feedback / request features',
  NOT_LISTED = 'Not listed',
}

export class SubscriptionSupportPage extends BaseLayout {
  readonly path = '/support';

  get contactUsHeading() {
    return this.page.getByRole('heading', { name: 'Contact Us' });
  }

  get productDropdown() {
    return this.page.locator('#product_chosen a.chosen-single');
  }

  get topicDropdown() {
    return this.page.locator('#topic_chosen a');
  }

  get appDropDown() {
    return this.page.locator('#app_chosen a');
  }

  get subjectTextbox() {
    return this.page.getByRole('textbox', { name: 'subject' });
  }

  get messageTextbox() {
    return this.page.getByLabel('Description of issue');
  }

  get cancelButton() {
    return this.page.getByRole('button', { name: 'Cancel' });
  }

  async fillOutSupportForm(
    product: string,
    topic: Topic,
    app: App,
    subject: string,
    message: string
  ) {
    await expect(this.contactUsHeading).toBeVisible();

    await this.productDropdown.click();
    await this.page.getByRole('option', { name: product }).click();
    await this.topicDropdown.click();
    await this.page.getByRole('option', { name: topic }).click();
    await this.appDropDown.click();
    await this.page.getByRole('option', { name: app }).click();
    await this.subjectTextbox.fill(subject);
    await this.messageTextbox.fill(message);
  }
}
