/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UrlData } from './url-data';
import { RouterWindow } from '../../window';
import {
  getPairingChannelHashParams,
  updatePairingChannelHashParams,
} from '../../pairing-channel-params';

/**
 * Creates a data store from the current URL state.
 * Uses window.location.hash to hold state.
 */
export class UrlHashData extends UrlData {
  constructor(public readonly window: RouterWindow) {
    super(window);
  }

  /**
   * The captured pairing fragment stands in only for a URL that has none of its
   * own. A live fragment always wins: the capture outlives the pairing flow in
   * this tab, so preferring it would let a finished pairing mask a later real
   * fragment such as `#connected-services`.
   */
  private get pairingParams() {
    if (this.window.location.hash?.replace(/^#/, '')) {
      return null;
    }
    return getPairingChannelHashParams();
  }

  protected getParams() {
    // The pairing fragment is taken out of the URL at startup so its channel key
    // cannot reach telemetry, which leaves the capture as its only source.
    return (
      this.pairingParams ??
      new URLSearchParams(this.window.location.hash?.replace(/^#/, ''))
    );
  }

  protected setParams(params: URLSearchParams) {
    // Mirror of getParams: whatever we would read from, we write back to.
    // Writing pairing params to the URL would undo the scrub.
    if (this.pairingParams) {
      updatePairingChannelHashParams(params);
      return;
    }
    const hash = '#' + params.toString();
    this.window.location.hash = hash;
  }
}
