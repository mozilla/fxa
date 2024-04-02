import jsQR from 'jsqr';
import UPNG from 'upng-js';
import { expect } from '../../lib/fixtures/standard';
import { SettingsLayout } from './layout';
import { getCode } from 'fxa-settings/src/lib/totp';
import { DataTrioComponent } from './components/dataTrio';

export type TotpCredentials = {
  secret: string;
  recoveryCodes: string[];
};

export class TotpPage extends SettingsLayout {
  readonly path = 'settings/two_step_authentication';

  get dataTrio() {
    return new DataTrioComponent(this.page);
  }

  get twoStepAuthenticationHeading() {
    return this.page.getByRole('heading', { name: 'Two-step authentication' });
  }

  get step1Heading() {
    return this.page.getByRole('heading', { name: 'Step 1 of 3' });
  }

  get step1CantScanCodeLink() {
    return this.page.getByTestId('cant-scan-code');
  }

  get step1ManualCode() {
    return this.page.getByTestId('manual-code');
  }

  get step1AuthenticationCodeTextbox() {
    return this.page.getByTestId('totp-input-label');
  }

  get step1SubmitButton() {
    return this.page.getByTestId('submit-totp');
  }

  get step2Heading() {
    return this.page.getByRole('heading', { name: 'Step 2 of 3' });
  }

  get step2recoveryCodes() {
    return this.page.getByTestId('datablock');
  }

  get step2ContinueButton() {
    return this.page.getByTestId('ack-recovery-code');
  }

  get step3Heading() {
    return this.page.getByRole('heading', { name: 'Step 3 of 3' });
  }

  get step3FinishButton() {
    return this.page.getByTestId('submit-recovery-code');
  }

  get step3RecoveryCodeTextbox() {
    return this.page.getByTestId('recovery-code-input-field');
  }

  async useQRCode() {
    const qr = await this.page.waitForSelector('[data-testid="2fa-qr-code"]');
    const png = await qr.screenshot();
    const img = UPNG.decode(png);
    const { data } = jsQR(
      new Uint8ClampedArray(UPNG.toRGBA8(img)[0]),
      img.width,
      img.height
    ) || { data: null };
    if (data === null) {
      throw new Error('No QR code found');
    }

    const secret = new URL(data).searchParams.get('secret');
    if (secret === null) {
      throw new Error('No secret found in QR code');
    }

    const code = await getCode(secret);
    await this.page.fill('input[type=text]', code);
    return secret;
  }

  async getNextCode(secret: string) {
    return await getCode(secret);
  }

  async useManualCode(): Promise<string> {
    await this.step1CantScanCodeLink.click();
    const secret = (await this.step1ManualCode.innerText())?.replace(/\s/g, '');
    const code = await getCode(secret);
    await this.step1AuthenticationCodeTextbox.fill(code);
    return secret;
  }

  async getRecoveryCodes(): Promise<string[]> {
    const codesRaw = await this.step2recoveryCodes.textContent();
    return codesRaw ? codesRaw.trim().split(/\s+/) : [];
  }

  async fillOutTwoStepAuthenticationForm(
    method: 'qr' | 'manual' = 'manual'
  ): Promise<TotpCredentials> {
    await expect(this.twoStepAuthenticationHeading).toBeVisible();
    await expect(this.step1Heading).toBeVisible();

    const secret =
      method === 'qr' ? await this.useQRCode() : await this.useManualCode();
    await this.step1SubmitButton.click();

    await expect(this.step2Heading).toBeVisible();

    const recoveryCodes = await this.getRecoveryCodes();
    await this.step2ContinueButton.click();

    await expect(this.step3Heading).toBeVisible();

    await this.step3RecoveryCodeTextbox.fill(recoveryCodes[0]);
    await this.step3FinishButton.click();

    return { secret, recoveryCodes };
  }
}
