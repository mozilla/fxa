/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page } from '@playwright/test';

export type WebChannelEvent = {
  command: string;
  data: Record<string, unknown>;
};

// Events live on the Node side, keyed by Page, so they survive cross-origin
// navigation (the OAuth redirect after signin would otherwise wipe the
// sessionStorage-based capture the page-side firefox.send writes to).
const capturePerPage = new WeakMap<Page, WebChannelEvent[]>();
const installPerPage = new WeakSet<Page>();

export async function installWebChannelCapture(page: Page): Promise<void> {
  if (installPerPage.has(page)) return;
  installPerPage.add(page);

  const events: WebChannelEvent[] = [];
  capturePerPage.set(page, events);

  await page.exposeBinding(
    '__fxaWebChannelCapture',
    (_source, evt: WebChannelEvent) => {
      events.push(evt);
    }
  );

  await page.addInitScript(() => {
    window.addEventListener('WebChannelMessageToChrome', (e: Event) => {
      try {
        const detail = JSON.parse((e as CustomEvent).detail);
        (
          window as unknown as {
            __fxaWebChannelCapture: (evt: WebChannelEvent) => void;
          }
        ).__fxaWebChannelCapture({
          command: detail.message.command,
          data: detail.message.data,
        });
      } catch {
        // Swallow malformed messages; non-WebChannel CustomEvents may appear here.
      }
    });
  });
}

export function getCapturedWebChannelEvents(page: Page): WebChannelEvent[] {
  return capturePerPage.get(page) ?? [];
}

export function clearCapturedWebChannelEvents(page: Page): void {
  const events = capturePerPage.get(page);
  if (events) events.length = 0;
}
