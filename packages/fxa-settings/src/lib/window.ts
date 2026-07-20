/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Export window so it's possible to jest.mock the import of it in tests.

const theRealWindow = window;
export { theRealWindow as window };

/**
 * Wraps browser window APIs for testability.
 */
export class RouterWindow {
  /**
   * Provides access to the window location API.
   */
  public get location() {
    return this.opts?.location || window.location;
  }

  /**
   * Provides access to the window's navigate function.
   */
  public get navigate() {
    return (
      this.opts?.navigate ||
      ((path: string) => window.history.pushState(null, '', path))
    );
  }

  /**
   * Provides access to the window's history API.
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
   * @param opts - A set of options to override the default behaviors of window APIs.
   */
  public constructor(
    private readonly opts?: {
      location?: Location;
      navigate?: (path: string) => void;
      history?: History;
      localStorage?: Storage;
      sessionStorage?: Storage;
    }
  ) {}
}

/** @deprecated Use RouterWindow instead */
export const ReachRouterWindow = RouterWindow;
