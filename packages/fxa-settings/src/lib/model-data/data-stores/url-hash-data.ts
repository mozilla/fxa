/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UrlData } from './url-data';
import { ReachRouterWindow } from '../../window';

/**
 * Creates a data store from the current URL state.
 * Uses window.location.hash to hold state.
 */
export class UrlHashData extends UrlData {
  constructor(public readonly window: ReachRouterWindow) {
    super(window);
  }

  protected getParams() {
    return new URLSearchParams(this.window.location.hash?.replace(/^#/, ''));
  }

  protected setParams(params: URLSearchParams) {
    const hash = '#' + params.toString();
    this.window.location.hash = hash;
  }
}
