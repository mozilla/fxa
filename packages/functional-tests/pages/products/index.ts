import { BaseLayout } from '../layout';

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
