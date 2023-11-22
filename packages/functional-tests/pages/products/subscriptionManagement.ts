import { BaseLayout } from '../layout';

export class SubscriptionManagementPage extends BaseLayout {
  readonly path = '/subscription';

  async subscriptiontHeader() {
    const header = this.page.locator('#subscriptions-support');
    await header.waitFor({ state: 'visible' });
    return header.isVisible();
  }

  async cancelSubscription() {
    return Promise.all([
      await this.page
        .locator('[data-testid="reveal-cancel-subscription-button"]')
        .click(),
      await this.page
        .locator('[data-testid="confirm-cancel-subscription-checkbox"]')
        .click(),
      await this.page
        .locator('[data-testid="cancel-subscription-button"]')
        .click(),
      await this.page.locator('[data-testid="dialog-dismiss"]').click(),
    ]);
  }

  async changeStripeCardDetails() {
    const frame = this.page.frame({ url: /elements-inner-card/ });
    if (!frame) {
      throw new Error('No frame found');
    }
    await this.page
      .locator('[data-testid="reveal-payment-update-button"]')
      .click();
    await this.page.locator('[data-testid="name"]').fill('Test User');
    await frame.fill('.InputElement[name=cardnumber]', '');
    await frame.fill('.InputElement[name=cardnumber]', '5555555555554444');
    await frame.fill('.InputElement[name=exp-date]', '444');
    await frame.fill('.InputElement[name=cvc]', '777');
    // await frame.fill('.InputElement[name=postal]', '88888');
    await this.page.locator('[data-testid="submit"]').click();
  }

  async clickPaypalChange() {
    const changeButton = this.page.locator(
      '[data-testid="change-payment-update-button"]'
    );
    await changeButton.waitFor({ state: 'visible' });
    const [paypalWindow] = await Promise.all([
      this.page.waitForEvent('popup'),
      this.page.locator('[data-testid="change-payment-update-button"]').click(),
    ]);
    await paypalWindow.waitForLoadState('load');
    return paypalWindow;
  }

  async loginPaypal() {
    await this.page.locator('input[type=password]').fill('Ah4SboP6UDZx95I');
    await this.page.locator('button[id=btnLogin]').click();
  }

  async updatePaypalAccount() {
    await this.page.locator('#fundingLink').click();
    await this.page.waitForLoadState();
    const cardOption = this.page.locator(
      'input[type="radio"][data-type="CREDIT_CARD"]'
    );
    await cardOption.click();
    const saveChanges = this.page.locator('button[name="SaveFI"]');
    await saveChanges.click();
    const submit = this.page.locator('button[name="modalClose"]');
    await submit.click();
  }

  async checkPaypalAccount() {
    const account = this.page.locator('#fundingLink');
    await account.waitFor({ state: 'visible' });
    return account.textContent();
  }

  async fillSupportForm() {
    await this.page.locator('[data-testid="contact-support-button"]').click();
    await this.page.locator('#product_chosen a.chosen-single').click();
    await this.page
      .locator(
        '#product_chosen ul.chosen-results li[data-option-array-index="1"]'
      )
      .click();
    await this.page.locator('#topic_chosen a.chosen-single').click();
    await this.page
      .locator(
        '#topic_chosen ul.chosen-results li[data-option-array-index="1"]'
      )
      .click();
    await this.page.locator('#app_chosen a.chosen-single').click();
    await this.page
      .locator('#app_chosen ul.chosen-results li[data-option-array-index="1"]')
      .click();
    await this.page.locator('input[name="subject"]').fill('Test Support');
    await this.page
      .locator('textarea[name=message]')
      .fill('Testing Support Form');
  }

  async submitSupportForm() {
    return await this.page.locator('button[type=submit]').click();
  }

  async cancelSupportForm() {
    await this.page.locator('button.cancel').click();
    await this.page.waitForLoadState();
  }

  async resubscribe() {
    return Promise.all([
      await this.page
        .locator('[data-testid="reactivate-subscription-button"]')
        .click(),
      await this.page
        .locator('[data-testid="reactivate-subscription-confirm-button"]')
        .click(),
      await this.page
        .locator('[data-testid="reactivate-subscription-success-button"]')
        .click(),
    ]);
  }

  getCardInfo() {
    return this.page
      .locator('[data-testid="card-logo-and-last-four"]')
      .textContent();
  }

  async subscriptionDetails() {
    return this.page.locator('[data-testid="subscription-item"]').textContent();
  }

  getResubscriptionPrice() {
    return this.page
      .locator('[data-testid="price-details-standalone"]')
      .textContent();
  }
}
