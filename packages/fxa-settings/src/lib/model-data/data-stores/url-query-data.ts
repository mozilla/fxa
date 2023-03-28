/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UrlData, WindowWrapper } from './url-data';

/**
 * Creates a data store from the current URL state.
 * Uses window.location.search (ie the query params) to hold state.
 */
export class UrlQueryData extends UrlData {
  constructor(public readonly window: WindowWrapper) {
    super(window);
  }

  protected getParams() {
    return new URLSearchParams(this.window.location.search);
  }

  protected setParams(params: URLSearchParams) {
    const url = new URL(this.window.location.href);
    url.search = params.toString();
    // Use replaceState URL, but prevent page loads or history changes
    this.window.history.replaceState({}, '', url.toString());
  }

  public toSearchQuery() {
    return this.getParams().toString();
  }
}
