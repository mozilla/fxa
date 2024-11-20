/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReachRouterWindow } from '../../window';
import { UrlData } from './url-data';

/**
 * Creates a data store from the current URL state.
 * Uses window.location.search (ie the query params) to hold state.
 */
export class UrlQueryData extends UrlData {
  private readonly promises: Array<Promise<void>> = [];
  private internalState: URLSearchParams;

  constructor(public readonly window: ReachRouterWindow) {
    super(window);
    this.internalState = new URLSearchParams(this.window.location.search);
  }

  /**
   * Provides the current state
   * @returns
   */
  protected getParams() {
    return this.internalState;
  }

  /**
   * Sets a new internal state from a set of URL search params
   * @param params
   */
  public setParams(params: URLSearchParams) {
    // Immediately update the internal state
    this.internalState = params;

    // Make a best effort to keep the url in sync. Note that
    // this request is asynchronous which can cause weird races
    // occasionally. In order to avoid race conditions, use the
    // the synchronized() method to ensure URL state has settled.
    const setNav = async () => {
      // Ensures we don't write too fast to the location
      await this.synchronized();

      // Construct new URL with updated query string and navigate
      const url = new URL(this.window.location.href);
      const search = params.toString();
      url.search = search;

      await this.window.navigate(url.toString(), {
        state: this.window.location.state,
        replace: false,
      });
    };
    this.promises.push(setNav());
  }

  /**
   * Makes sure any changes to URL query string have settled
   */
  public async synchronized() {
    await Promise.all(this.promises);
    while (this.promises.length) {
      this.promises.pop();
    }
  }

  /**
   * Updates the internal state from the current window.location.search value
   */
  public async refresh() {
    // Make sure all changes have settled then refresh based on the query string state.
    await this.synchronized();
    this.internalState = new URLSearchParams(this.window.location.search);
  }

  /**
   * Makes sure all changes have settled and returns the current search query string
   * @returns
   */
  public async toSearchQuery() {
    await this.synchronized();
    return this.window.location.search;
  }
}
