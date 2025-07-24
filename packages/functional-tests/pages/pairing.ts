import { expect } from '@playwright/test';
import { BaseLayout } from "./layout";

export class PairingPage extends BaseLayout {
  readonly path = '/pair';

  get pairHeading() {
    return this.page.getByRole('heading', { name: 'Connect another device' });
  }

  get qrCodeImage() {
    return this.page.getByTestId('qr-code-image');
  }

  get hasMobileButton() {
    return this.page.getByText('I already have Firefox for mobile' );
  }
  get doesNotHaveMobileButton() {
    return this.page.getByText('I don\'t have Firefox for mobile');
  }
  get continueButton() {
    return this.page.getByText('Continue').getByRole('button');
  }

  /**
   * Determine which path to proceed down on the `/pair` page.
   * - `hasFirefox` will click the "I have Firefox" button and Continue.
   *   - NOTE: This sends the user to the `about:preferences#sync` page, which can
   * and will crash the browser context. Only use this if it's wrapped in a
   * `try/catch` block. You'll need to make a new page context to continue
   * the pairing flow.
   * - `noFirefox` will click the "I don't have Firefox" button and Continue.
   */
  async startPairing(option: 'hasMobile' | 'doesNotHaveMobile' = 'hasMobile') {
    await expect(this.pairHeading).toBeVisible();

    await this[`${option}Button`].click();

    await this.continueButton.click();
  }
}
