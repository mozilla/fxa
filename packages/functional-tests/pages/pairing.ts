import { expect } from '@playwright/test';
import { BaseLayout } from "./layout";

export class PairingPage extends BaseLayout {
  readonly path = '/pair';

  get pairHeading() {
    return this.page.getByRole('heading', { name: 'Pair Device' });
  }

  get startPairingButton() {
    return this.page.getByRole('button', { name: 'Start Pairing' });
  }

  get qrCodeImage() {
    return this.page.getByTestId('qr-code-image');
  }


  /**
   * TODO: Implement
   */
  async startPairing() {
    await expect(this.pairHeading).toBeVisible();
    await this.startPairingButton.click();
    await expect(this.qrCodeImage).toBeVisible();
  }
}
