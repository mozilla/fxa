import { BaseLayout } from '../layout';
import { BrowserContext } from 'playwright';
let context: BrowserContext;

export class SubscribePage extends BaseLayout {
  setFullName(name: string = 'Cave Johnson') {
    return this.page.fill('[data-testid="name"]', name);
  }

  async setCreditCardInfo() {
    const frame = this.page.frame({ url: /elements-inner-card/ });
    await frame.fill('.InputElement[name=cardnumber]', '4242424242424242');
    await frame.fill('.InputElement[name=exp-date]', '555');
    await frame.fill('.InputElement[name=cvc]', '333');
    await frame.fill('.InputElement[name=postal]', '66666');
    await this.page.check('input[type=checkbox]');
  }

  async setPayPalInfo() {
    await this.page.check('[data-testid="confirm"]');
    const [paypalWindow] = await Promise.all([
      this.page.waitForEvent('popup'),
      this.page.click('[data-testid="paypal-button-container"]'),
    ]);
    await paypalWindow.waitForTimeout(500);
    await paypalWindow.waitForLoadState('load');
    await paypalWindow.fill(
      'input[type=email]',
      'qa-test-no-balance-16@personal.example.com'
    );
    await paypalWindow.click('button[id=btnNext]');
    await paypalWindow.waitForLoadState('load');
    await paypalWindow.fill('input[type=password]', 'Ah4SboP6UDZx95I');
    await paypalWindow.click('button[id=btnLogin]');
    await paypalWindow.click('button[id=consentButton]');
  }

  submit() {
    return Promise.all([
      this.page.click('button[type=submit]'),
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
