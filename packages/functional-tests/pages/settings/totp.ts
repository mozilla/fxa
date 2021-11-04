import jsQR from 'jsqr';
import UPNG from 'upng-js';
import { SettingsLayout } from './layout';
import { getCode } from 'fxa-settings/src/lib/totp';
import { DataTrioComponent } from './components/dataTrio';
import { Credentials } from '../../lib/targets';

export class TotpPage extends SettingsLayout {
  readonly path = 'settings/two_step_authentication';

  get dataTrio() {
    return new DataTrioComponent(this.page);
  }

  async useQRCode() {
    const qr = await this.page.waitForSelector('[data-testid="2fa-qr-code"]');
    const png = await qr.screenshot();
    const img = UPNG.decode(png);
    const { data } = jsQR(
      new Uint8ClampedArray(UPNG.toRGBA8(img)[0]),
      img.width,
      img.height
    );
    const secret = new URL(data).searchParams.get('secret');
    const code = await getCode(secret);
    await this.page.fill('input[type=text]', code);
    return secret;
  }

  async useManualCode() {
    await this.page.click('[data-testid=cant-scan-code]');
    const secret = (
      await this.page.innerText('[data-testid=manual-code]')
    ).replace(/\s/g, '');
    const code = await getCode(secret);
    await this.page.fill('input[type=text]', code);
    return secret;
  }

  submit() {
    return this.page.click('button[type=submit]');
  }

  clickClose() {
    return Promise.all([
      this.page.click('[data-testid=close-button]'),
      this.page.waitForNavigation(),
    ]);
  }

  async getRecoveryCodes(): Promise<string[]> {
    await this.page.waitForSelector('[data-testid=datablock]');
    return this.page.$$eval('[data-testid=datablock] span', (elements) =>
      elements.map((el) => (el as HTMLElement).innerText)
    );
  }

  setRecoveryCode(code: string) {
    return this.page.fill('[data-testid=recovery-code-input-field]', code);
  }

  async enable(credentials: Credentials, method: 'qr' | 'manual' = 'manual') {
    const secret =
      method === 'qr' ? await this.useQRCode() : await this.useManualCode();
    await this.submit();
    const recoveryCodes = await this.getRecoveryCodes();
    await this.submit();
    await this.setRecoveryCode(recoveryCodes[0]);
    await this.submit();
    credentials.secret = secret;
    return {
      secret,
      recoveryCodes,
    };
  }
}
