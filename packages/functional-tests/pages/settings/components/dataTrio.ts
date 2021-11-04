import { Page } from '@playwright/test';

export class DataTrioComponent {
  constructor(readonly page: Page) {}

  async clickDownload() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.click('[data-testid=databutton-download]'),
    ]);
    return download;
  }

  async clickCopy(): Promise<string> {
    // override writeText so we can capture the value
    await this.page.evaluate(() => {
      //@ts-ignore
      window.clipboardText = null;
      //@ts-ignore
      navigator.clipboard.writeText = (text) => (window.clipboardText = text);
    });
    await this.page.click('[data-testid=databutton-copy]');
    //@ts-ignore
    return this.page.evaluate(() => window.clipboardText);
  }

  async clickPrint() {
    // override the print function
    // so that we can test that it was called
    await this.page.context().addInitScript(() => {
      //@ts-ignore window.printed
      window.print = () => (window.printed = true);
      window.close = () => {};
    });
    const [printPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.page.click('[data-testid=databutton-print]'),
    ]);
    //@ts-ignore window.printed
    const printed = await printPage.evaluate(() => window.printed);
    await printPage.close();
    return printed;
  }
}
