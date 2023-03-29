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
  constructor(public readonly window: ReachRouterWindow) {
    super(window);
  }

  protected getParams() {
    return new URLSearchParams(this.window.location.search);
  }

  protected setParams(params: URLSearchParams) {
    const url = new URL(this.window.location.href);
    url.search = params.toString();

    // Use replace false stops a page refresh
    this.window.navigate(url.toString(), {
      state: this.window.location.state,
      replace: true,
    });
  }

  public toSearchQuery() {
    return this.window.location.search;
  }
}
