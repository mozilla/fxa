/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NavigateFn, WindowLocation, globalHistory } from '@reach/router';

// Export window so it's possible to jest.mock the import of it in tests.

const theRealWindow = window;
export { theRealWindow as window };

/**
 * Combines reach router and browser window apis, preferring Reach Router apis if available.
 */
export class ReachRouterWindow {
  /**
   * Provides access to the current reach router's location API, or the window location API if the reach router isn't available.
   */
  public get location() {
    return this.opts?.location || globalHistory.location;
  }

  /**
   * Provides access to the reach router's navigate API.
   */
  public get navigate() {
    return this.opts?.navigate || globalHistory.navigate;
  }

  /**
   * Provides access to the windows history API.
   */
  public get history() {
    return this.opts?.history || window.history;
  }

  /**
   * Provides access to the window's localStorage API.
   */
  public get localStorage() {
    return this.opts?.localStorage || window.localStorage;
  }

  /**
   * Provides access to the window's sessionStorage API.
   */
  public get sessionStorage() {
    return this.opts?.sessionStorage || window.sessionStorage;
  }

  /**
   * Creates a new window wrapper instance
   * @param opts - A set of options to override the default behaviors of window API and reach router API.
   */
  public constructor(
    private readonly opts?: {
      location?: WindowLocation<any>;
      navigate?: NavigateFn;
      history?: History;
      localStorage?: Storage;
      sessionStorage?: Storage;
    }
  ) {}
}
