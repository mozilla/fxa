import { BaseLayout } from './layout';

export class SignInPage extends BaseLayout {
  readonly path = 'signin';
  readonly selectors = {
    PASSWORD_HEADER: '#fxa-signin-password-header',
  };

  get passwordHeader() {
    return this.page.locator(this.selectors.PASSWORD_HEADER);
  }
}
