import { BaseLayout } from '../layout';

export class SubscribePage extends BaseLayout {
  setFullName(name: string = 'Cave Johnson') {
    const input = this.page.locator('[data-testid="name"]');
    input.waitFor({ state: 'attached' });
    return input.fill(name);
  }

  async setConfirmPaymentCheckbox() {
    await this.page.check('[data-testid="confirm"]');
  }

  async setCreditCardInfo() {
    const frame = this.page.frame({ url: /elements-inner-card/ });
    await frame!.fill('.InputElement[name=cardnumber]', '');
    await frame!.fill('.InputElement[name=cardnumber]', '4242424242424242');
    await frame!.fill('.InputElement[name=exp-date]', '555');
    await frame!.fill('.InputElement[name=cvc]', '333');
    await frame!.fill('.InputElement[name=postal]', '66666');
  }

  async setFailedCreditCardInfo() {
    const frame = this.page.frame({ url: /elements-inner-card/ });
    await frame!.fill('.InputElement[name=cardnumber]', '4000000000000341');
    await frame!.fill('.InputElement[name=exp-date]', '666');
    await frame!.fill('.InputElement[name=cvc]', '444');
    await frame!.fill('.InputElement[name=postal]', '77777');
  }

  async clickPayNow() {
    const pay = this.page.locator('[data-testid="submit"]');
    await pay.waitFor();
    await pay.click();
  }

  async setPayPalInfo() {
    const paypalButton = this.page.locator(
      '[data-testid="paypal-button-container"]'
    );
    await paypalButton.waitFor({ state: 'visible' });

    const paypalWindowPromise = this.page.waitForEvent('popup');
    await this.page.locator('[data-testid="paypal-button-container"]').click();
    const paypalWindow = await paypalWindowPromise;

    await paypalWindow.waitForLoadState('load');
    await paypalWindow.waitForNavigation({
      url: /checkoutnow/,
    });
    await paypalWindow.fill(
      'input[type=email]',
      'qa-test-no-balance-16@personal.example.com'
    );
    await paypalWindow.click('button[id=btnNext]');
    await paypalWindow.waitForLoadState('load');
    await paypalWindow.fill('input[type=password]', 'Ah4SboP6UDZx95I');
    await paypalWindow.click('button[id=btnLogin]');
    await paypalWindow.waitForLoadState();
    await paypalWindow.click('button[id=consentButton]');
  }

  async addCouponCode(code) {
    const input = this.page.locator('[data-testid="coupon-input"]');
    await input.waitFor({ state: 'visible' });
    await input.fill(code);
    await this.page.locator('[data-testid="coupon-button"]').click();
  }

  async clickTryAgain() {
    await this.page.locator('[data-testid="retry-link"]').click();
  }

  async couponErrorMessageText() {
    const msg = await this.page.innerText('[data-testid="coupon-error"]');
    if (msg === 'An error occurred processing the code. Please try again.') {
      throw new Error('Generic error, most likely rate limited');
    }
    return msg;
  }

  async discountAppliedSuccess() {
    const discount = this.page.locator(
      '[data-testid="coupon-component"]:has-text("Promo Code Applied")'
    );
    await discount.waitFor();
    return discount.isVisible();
  }

  async oneTimeDiscountSuccess() {
    const discount = this.page.locator(
      '[data-testid="coupon-success"]:has-text("Your plan will automatically renew at the list price.")'
    );
    await discount.waitFor();
    return discount.isVisible();
  }

  async discountListPrice() {
    const listPrice = this.page.locator(
      '.plan-details-item:has-text("List Price")'
    );
    await listPrice.waitFor();
    return listPrice.isVisible();
  }

  async discountLineItem() {
    const disc = this.page.locator('.plan-details-item:has-text("Promo Code")');
    return disc.isVisible();
  }

  getTotalPrice() {
    return this.page.locator('[data-testid="total-price"]').textContent();
  }

  async discountTextbox() {
    const discount = this.page.locator(
      '.coupon-component:has-text("Promo Code")'
    );
    await discount.waitFor();
    return discount.isVisible();
  }

  async removeCouponCode() {
    await this.page.locator('[data-testid="coupon-remove-button"]').click();
  }

  planUpgradeDetails() {
    return this.page
      .locator('[data-testid="plan-upgrade-details-component"]')
      .textContent();
  }
  async clickConfirmPlanChange() {
    await this.page.locator('[data-testid="confirm"]').click();
  }

  async isSubscriptionSuccess() {
    const success = this.page.locator(
      '[data-testid="subscription-success-title"]'
    );
    await success.waitFor();
    return success.isVisible();
  }

  submit() {
    return Promise.all([
      this.page.waitForLoadState(),
      this.page.waitForResponse(
        (r) =>
          r.request().method() === 'GET' &&
          /\/mozilla-subscriptions\/customer\/billing-and-subscriptions$/.test(
            r.request().url()
          )
      ),
    ]);
  }
}
