/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReachRouterWindow } from '../../window';
import { ModelDataStore } from '../model-data-store';

/**
 * A data store that wraps Reach Router's `window.location.state`.
 */
export class LocationStateData extends ModelDataStore {
  constructor(protected readonly window: ReachRouterWindow) {
    super();

    if (window.location.state == null) {
      window.location.state = {};
    }
  }

  get state() {
    return this.window.location.state;
  }

  public getKeys() {
    return Object.keys(this.state);
  }

  public get(key: string) {
    return this.state[key];
  }

  public set(key: string, value: unknown) {
    this.state[key] = value;
  }
}
