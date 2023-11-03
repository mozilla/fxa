/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReachRouterWindow } from '../../window';
import { RawData, ModelDataStore } from '../model-data-store';

// TODO: Adapt to using ../../storage implementation. We need a way to migrate / deal with the namespace issue though.

/**
 * A data store using window.sessionStorage or window.localStorage to hold state.
 */
export class StorageData extends ModelDataStore {
  private static readonly NAMESPACE = '__fxa_session';
  private static readonly PERSIST_TO_LOCAL_STORAGE = ['oauth'];

  private state: Record<string, RawData>;

  constructor(private window: ReachRouterWindow) {
    super();
    this.state = {};
    this.load();
  }

  public requiresSync() {
    return true;
  }

  public load() {
    let values = {};

    // Try parsing sessionStorage values
    try {
      const sessionStorageValueRaw = this.window.sessionStorage.getItem(
        StorageData.NAMESPACE
      );
      if (sessionStorageValueRaw != null) {
        values = {
          ...values,
          ...JSON.parse(sessionStorageValueRaw),
        };
      }
    } catch (e) {
      console.error('Cannot save to session storage');
      // ignore the parse error.
    }

    // Try parsing localStorage values
    try {
      const localStorageValueRaw = this.window.localStorage.getItem(
        StorageData.NAMESPACE
      );
      if (localStorageValueRaw != null) {
        values = {
          ...values,
          ...JSON.parse(localStorageValueRaw),
        };
      }
    } catch (e) {
      console.error('Cannot save to local storage');
      // ignore the parse error.
    }

    this.state = values;
  }

  public persist() {
    const toSaveToSessionStorage: Record<string, any> = {};
    const toSaveToLocalStorage: Record<string, any> = {};

    for (const key in this.state) {
      const value = this.state[key];

      if (StorageData.PERSIST_TO_LOCAL_STORAGE.indexOf(key) >= 0) {
        toSaveToLocalStorage[key] = value;
      } else {
        toSaveToSessionStorage[key] = value;
      }
    }

    // Wrap browser storage access in a try/catch block because some browsers
    // (Firefox, Chrome) except when trying to access browser storage and
    // cookies are disabled.
    try {
      this.window.localStorage.setItem(
        StorageData.NAMESPACE,
        JSON.stringify(toSaveToLocalStorage)
      );
      this.window.sessionStorage.setItem(
        StorageData.NAMESPACE,
        JSON.stringify(toSaveToSessionStorage)
      );
    } catch (e) {
      // some browsers disable access to browser storage
      // if cookies are disabled.
      console.error('Error saving local state');
    }
  }

  public getKeys() {
    return Object.keys(this.state);
  }

  public get(key: string): RawData {
    return this.state[key];
  }

  public set(key: string, value: RawData) {
    this.state[key] = value;
  }
}
