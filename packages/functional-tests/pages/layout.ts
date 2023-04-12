import { Page } from '@playwright/test';
import { BaseTarget } from '../lib/targets/base';

export abstract class BaseLayout {
  readonly path?: string;

  constructor(public page: Page, protected readonly target: BaseTarget) {}

  protected get baseUrl() {
    return this.target.baseUrl;
  }

  get url() {
    return `${this.baseUrl}/${this.path}`;
  }

  goto(waitUntil: 'networkidle' | 'domcontentloaded' | 'load' = 'load') {
    return this.page.goto(this.url, { waitUntil });
  }

  screenshot() {
    return this.page.screenshot({ fullPage: true });
  }

  async checkWebChannelMessage(command) {
    await this.page.evaluate(async (command) => {
      const noNotificationError = new Error(
        `NoSuchBrowserNotification - ${command}`
      );

      await new Promise((resolve, reject) => {
        const timeoutHandle = setTimeout(
          () => reject(noNotificationError),
          2000
        );

        function findMessage() {
          const messages = JSON.parse(
            sessionStorage.getItem('webChannelEvents') || '[]'
          );
          const m = messages.find((x) => x.command === command);

          if (m) {
            clearTimeout(timeoutHandle);
            resolve(m);
          } else {
            setTimeout(findMessage, 50);
          }
        }

        findMessage();
      });
    }, command);
  }

  async noSuchWebChannelMessage(command) {
    await this.page.evaluate(async (command) => {
      const unexpectedNotificationError = new Error(
        `UnepxectedBrowserNotification - ${command}`
      );

      await new Promise((resolve, reject) => {
        const timeoutHandle = setTimeout(resolve, 1000);

        function findMessage() {
          const messages = JSON.parse(
            sessionStorage.getItem('webChannelEvents') || '[]'
          );
          const m = messages.find((x) => x.command === command);

          if (m) {
            clearTimeout(timeoutHandle);
            reject(unexpectedNotificationError);
          } else {
            setTimeout(findMessage, 50);
          }
        }

        findMessage();
      });
    }, command);
  }

  async listenToWebChannelMessages() {
    await this.page.evaluate(() => {
      function listener(msg) {
        const detail = JSON.parse(msg.detail);
        const events = JSON.parse(
          sessionStorage.getItem('webChannelEvents') || '[]'
        );
        events.push({
          command: detail.message.command,
          detail: detail.message.data,
        });
        sessionStorage.setItem('webChannelEvents', JSON.stringify(events));
      }
      // eslint-disable-next-line no-restricted-globals
      addEventListener('WebChannelMessageToChrome', listener);
    });
  }
}
