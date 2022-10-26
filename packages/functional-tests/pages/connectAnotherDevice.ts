import { BaseLayout } from './layout';

export class ConnectAnotherDevicePage extends BaseLayout {
  readonly path = 'connect_another_device';

  readonly selectors = {
    CONNECT_ANOTHER_DEVICE_HEADER: '#fxa-connect-another-device-header',
    CONNECT_ANOTHER_DEVICE_SIGNIN_BUTTON: 'form div a',
    TEXT_INSTALL_FX_DESKTOP: '#install-mobile-firefox-desktop',
    SUCCESS: '.success',
  };

  get header() {
    return this.page.locator(this.selectors.CONNECT_ANOTHER_DEVICE_HEADER);
  }

  get signInButton() {
    return this.page.locator(
      this.selectors.CONNECT_ANOTHER_DEVICE_SIGNIN_BUTTON
    );
  }

  get installFxDesktop() {
    return this.page.locator(this.selectors.TEXT_INSTALL_FX_DESKTOP);
  }

  get success() {
    return this.page.locator(this.selectors.SUCCESS);
  }
}
