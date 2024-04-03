/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page } from '@playwright/test';
import { BaseTarget } from '../lib/targets/base';
import { CustomEventDetail } from '../lib/channels';

export abstract class BaseLayout {
  /**
   * The expected path of the current page. This works with checkPath(). If left empty,
   * checkPath will always pass. If defined, checkPass will enforce that this value is
   * in the URL.
   */
  abstract get path(): string;

  constructor(public page: Page, protected readonly target: BaseTarget) {}

  protected get baseUrl() {
    return this.target.baseUrl;
  }

  get url() {
    return `${this.baseUrl}/${this.path}`;
  }

  /**
   * Checks that the current path maps to the POM's expected path. This can be called before querying for locators in
   * child classes to make locators more robust and avoid false positives. If the current path does not exist in the URL,
   * an error will be thrown.
   */
  checkPath() {
    if (this.path) {
      if (this.page.url().indexOf(this.path) < 0) {
        throw new Error(
          `Invalid page state detected! Expected ${
            this.path
          } to be in url, ${this.page.url()}`
        );
      }
    }
  }

  goto(
    waitUntil: 'networkidle' | 'domcontentloaded' | 'load' = 'load',
    query?: string | URLSearchParams
  ) {
    const url = query ? `${this.url}?${query}` : this.url;
    return this.page.goto(url, { waitUntil });
  }

  screenshot() {
    return this.page.screenshot({ fullPage: true });
  }

  async clearCache() {
    await this.page.goto(`${this.target.contentServerUrl}/clear`);
    await this.page.context().clearCookies();
    await this.page.waitForTimeout(2000);
  }

  async clearSessionStorage() {
    await this.page.evaluate(() => {
      sessionStorage.clear();
    });
  }

  async checkWebChannelMessage(command) {
    await this.page.evaluate(async (command) => {
      const noNotificationError = new Error(
        `NoSuchBrowserNotification - ${command}`
      );

      await new Promise((resolve, reject) => {
        const timeoutHandle = setTimeout(
          () => reject(noNotificationError),
          5000
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
      addEventListener('WebChannelMessageToChrome', listener);
    });
  }

  /**
   * Send a web channel message from browser to web content.
   * NOTE: Prefer `respondToWebChannelMessage` where possible! This should only be
   * used when we can't attach a listener in time (which respondToWebChannelMessage
   * does) because the event is fired on page load before the listener can attach.
   * This currently happens on React SignUp which we should revisit when the index
   * index page has been converted to React and our event handling moved.
   */
  async sendWebChannelMessage(customEventDetail: CustomEventDetail) {
    // Using waitForTimeout is naturally flaky, I'm not sure of other options
    // to ensure that browser has had time send all web channel messages.
    await this.page.waitForTimeout(2000);
    await this.page.evaluate(
      ({ customEventDetail }) => {
        window.dispatchEvent(
          new CustomEvent('WebChannelMessageToContent', {
            detail: customEventDetail,
          })
        );
      },
      { customEventDetail }
    );
  }

  /**
   * Listens for a `WebChannelMessageToChrome` web channel event which
   * occurs when we (web content) send a message to the browser.
   *
   * Responds with a `WebChannelMessageToContent` event containing event
   * details passed in only when the given command matches the command from
   * the listened-for event.
   *
   * @param webChannelMessage - Custom event details to send to the web content.
   */
  async respondToWebChannelMessage(webChannelMessage) {
    const expectedCommand = webChannelMessage.message.command;
    const response = webChannelMessage.message.data;

    await this.page.evaluate(
      ({ expectedCommand, response }) => {
        function listener(e) {
          const detail = JSON.parse((e as CustomEvent).detail);
          const command = detail.message.command;
          const messageId = detail.message.messageId;

          if (command === expectedCommand) {
            window.removeEventListener('WebChannelMessageToChrome', listener);
            const event = new CustomEvent('WebChannelMessageToContent', {
              detail: {
                id: 'account_updates',
                message: {
                  command,
                  data: response,
                  messageId,
                },
              },
            });

            window.dispatchEvent(event);
          }
        }

        function startListening() {
          try {
            window.addEventListener('WebChannelMessageToChrome', listener);
          } catch (e) {
            // problem adding the listener, window may not be
            // ready, try again.
            setTimeout(startListening, 0);
          }
        }

        startListening();
      },
      { expectedCommand, response }
    );
  }
}
