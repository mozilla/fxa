/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Page, Route } from '@playwright/test';
import { gunzipSync } from 'zlib';

export interface GleanPing {
  eventName: string;
  extras: Record<string, string>;
  payload: Record<string, any>;
  url: string;
  timestamp: number;
}

/**
 * Intercepts Glean HTTP pings via page.route() and exposes captured events
 * for assertions in functional tests.
 *
 * Must be started (via start()) BEFORE any page.goto() calls, since
 * page.route() only intercepts requests registered before navigation.
 */
export class GleanEventsHelper {
  private pings: GleanPing[] = [];
  private page: Page;
  private started = false;
  private readonly ROUTE_PATTERN = '**/submit/accounts*frontend*/**';

  constructor(page: Page) {
    this.page = page;
  }

  async start(): Promise<void> {
    if (this.started) return;
    this.started = true;

    // Glean.js uses navigator.sendBeacon() which Playwright's page.route()
    // cannot intercept. Monkey-patch sendBeacon to use fetch() instead.
    await this.page.addInitScript(() => {
      // eslint-disable-next-line no-undef
      navigator.sendBeacon = function (url: string, data?: BodyInit | null) {
        fetch(url, {
          method: 'POST',
          body: data,
          keepalive: true,
          mode: 'no-cors',
        }).catch(() => {});
        return true;
      };
    });

    await this.page.route(this.ROUTE_PATTERN, async (route: Route) => {
      const request = route.request();

      if (request.method() !== 'POST') {
        await route.fulfill({ status: 200 });
        return;
      }

      try {
        const body = this.parseRequestBody(request);
        const eventName = body?.metrics?.string?.['event.name'];

        if (eventName) {
          // FxA stores event metadata as string metrics (event.reason, etc.)
          const stringMetrics = body?.metrics?.string ?? {};
          const extras: Record<string, string> = {};
          for (const [key, value] of Object.entries(stringMetrics)) {
            if (key.startsWith('event.') && key !== 'event.name') {
              extras[key.replace('event.', '')] = value as string;
            }
          }
          this.pings.push({
            eventName,
            extras,
            payload: body,
            url: request.url(),
            timestamp: Date.now(),
          });
        }
      } catch {
        // Silently ignore parse errors — non-event pings are expected
      }

      await route.fulfill({ status: 200 });
    });
  }

  async stop(): Promise<void> {
    if (!this.started) return;
    await this.page.unroute(this.ROUTE_PATTERN);
    this.started = false;
  }

  private parseRequestBody(
    request: ReturnType<Route['request']>
  ): Record<string, any> {
    const contentEncoding = request.headers()['content-encoding'];
    const rawBody = request.postDataBuffer();

    if (!rawBody) return {};

    if (contentEncoding === 'gzip') {
      const decompressed = gunzipSync(rawBody);
      return JSON.parse(decompressed.toString('utf-8'));
    }

    return JSON.parse(rawBody.toString('utf-8'));
  }

  getEventNames(): string[] {
    return this.pings.map((p) => p.eventName);
  }

  hasEvent(name: string): boolean {
    return this.pings.some((p) => p.eventName === name);
  }

  getEventsByName(name: string): GleanPing[] {
    return this.pings.filter((p) => p.eventName === name);
  }

  getPings(): GleanPing[] {
    return [...this.pings];
  }

  clear(): void {
    this.pings = [];
  }

  /**
   * Polls until an event with the given name appears.
   * @param name The event name to wait for.
   * @param timeout Maximum wait time in ms (default 5000).
   * @param interval Poll interval in ms (default 100).
   */
  async waitForEvent(
    name: string,
    timeout = 5000,
    interval = 100
  ): Promise<GleanPing> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const ping = this.pings.find((p) => p.eventName === name);
      if (ping) return ping;
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error(
      `Timed out waiting for Glean event "${name}" after ${timeout}ms.\n` +
        `Captured events: [${this.getEventNames().join(', ')}]`
    );
  }

  /**
   * Asserts that the given events appeared in order (not necessarily
   * contiguous — other events may appear between them).
   *
   * Filters captured events to only those in the expected list, then
   * checks sequential order.
   *
   * @param expectedSequence Event names in the expected order.
   */
  assertEventOrder(expectedSequence: string[]): void {
    const captured = this.getEventNames();
    const expectedSet = new Set(expectedSequence);

    const relevant = captured.filter((name) => expectedSet.has(name));

    let expectedIdx = 0;
    for (const eventName of relevant) {
      if (
        expectedIdx < expectedSequence.length &&
        eventName === expectedSequence[expectedIdx]
      ) {
        expectedIdx++;
      }
    }

    if (expectedIdx !== expectedSequence.length) {
      throw new Error(
        `Glean event order mismatch.\n` +
          `Expected sequence: [${expectedSequence.join(', ')}]\n` +
          `Relevant captured: [${relevant.join(', ')}]\n` +
          `All captured:      [${captured.join(', ')}]`
      );
    }
  }
}
