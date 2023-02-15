/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UrlContext } from './url-context';

/**
 * Uses window.location.search to store state in set of url search parameter like strings.
 */
export class UrlSearchContext extends UrlContext {
  constructor(public readonly window: Window) {
    super(window);
  }

  protected getParams() {
    return new URLSearchParams(this.window.location.search);
  }

  protected setParams(params: URLSearchParams) {
    const url = new URL(this.window.location.href);
    url.search = params.toString();
    // Use replaceState URL, but prevent page loads or history changes
    this.window.history.replaceState({}, '', url);
  }
}
