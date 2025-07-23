import { Page } from "@playwright/test";
import { BaseTarget } from "../lib/targets/base";
import { BaseLayout } from "./layout";
export class BrowserSettingsPage extends BaseLayout {
  get path(): string {
    return '';
  }
  get pairingQrCodeImage() {
    return this.page.locator('box.qrContainer');
  }
  constructor(page: Page, target: BaseTarget) {
    super(page, target);
  }

  async getPairingQrCodeImg(): Promise<Buffer> {
    const qrCodeElement = this.pairingQrCodeImage;
    if (await qrCodeElement.isVisible()) {
      return await qrCodeElement.screenshot();
    } else {
      throw new Error('QR Code image is not visible');
    }
  }

  /**
   * Because the preferences page is not a standard url path, we use this
   * method to navigate to it. Bypassing the path validation of `page.goto()`.
   */
  async gotoPreferences() {
    await this.page.goto('about:preferences');
  }
}
