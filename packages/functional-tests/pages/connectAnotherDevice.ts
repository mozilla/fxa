/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseLayout } from './layout';

export class ConnectAnotherDevicePage extends BaseLayout {
  readonly path = 'connect_another_device';

  readonly selectors = {
    CONNECT_ANOTHER_DEVICE_HEADER: '#fxa-connect-another-device-header',
    CONNECT_ANOTHER_DEVICE_SIGNIN_BUTTON: 'form div a',
    FXA_CONNECTED_HEADER: '#cad-header',
    TEXT_INSTALL_FX_DESKTOP: '#install-mobile-firefox-desktop',
    SUCCESS: '.success',
    NOT_NOW: '#cad-not-now',
    NOT_NOW_PAIR: '#choice-pair-not-now',
  };

  get header() {
    return this.page.locator(this.selectors.CONNECT_ANOTHER_DEVICE_HEADER);
  }

  get fxaConnected() {
    return this.page.locator(this.selectors.FXA_CONNECTED_HEADER);
  }

  get connectAnotherDeviceButton() {
    return this.page.getByRole('button', { name: 'Connect another device' });
  }

  get signInButton() {
    return this.page.locator(
      this.selectors.CONNECT_ANOTHER_DEVICE_SIGNIN_BUTTON
    );
  }

  get manageYourAccountButton() {
    return this.page.getByRole('link', { name: 'Manage your account' });
  }

  get installFxDesktop() {
    return this.page.locator(this.selectors.TEXT_INSTALL_FX_DESKTOP);
  }

  get success() {
    return this.page.locator(this.selectors.SUCCESS);
  }

  async clickNotNow() {
    return this.page.locator(this.selectors.NOT_NOW).click();
  }

  async clickNotNowPair() {
    return this.page.locator(this.selectors.NOT_NOW_PAIR).click();
  }
}
