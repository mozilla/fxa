/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReachRouterWindow } from '../../window';
import { ModelDataStore, RawData } from '../model-data-store';

/**
 * An abstract base class for persisting state in the URL.
 */
export abstract class UrlData extends ModelDataStore {
  protected abstract getParams(): URLSearchParams;
  protected abstract setParams(params: URLSearchParams): void;

  get pathName() {
    return this.window.location.pathname;
  }

  /**
   * @param window Current window
   * @param mode Whether or not to store state in the search query or the hash.
   */
  constructor(public readonly window: ReachRouterWindow) {
    super();
  }

  getKeys() {
    return this.getParams().keys();
  }

  get(key: string): RawData {
    const params = this.getParams();
    const value = params?.get(key);
    return value === null ? undefined : value;
  }

  set(key: string, val: RawData): void {
    if (val == null) {
      return;
    }
    // Get current state from URL
    const params = this.getParams();
    params.set(key, val);

    // Write back to url.
    this.setParams(params);
  }
}
