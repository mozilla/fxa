import { BaseLayout } from '../layout';

export class SubscriptionManagementPage extends BaseLayout {
  readonly path = '/subscription';

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

  getResubscriptionPrice() {
    return this.page
      .locator(
        '//html/body/div/div/div/div[2]/div/div/div/div/section[3]/div/div/div/div[1]/div[1]'
      )
      .textContent();
  }
}
