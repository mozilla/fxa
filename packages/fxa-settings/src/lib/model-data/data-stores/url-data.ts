/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelDataStore } from '../model-data-store';
import { WindowLocation, HistorySource } from '@reach/router';

export type Location = Pick<
  WindowLocation,
  'href' | 'pathname' | 'search' | 'hash'
>;
export type History = Pick<HistorySource, 'history'>;

export type WindowWrapper = History & {
  location: Location;
};

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
  constructor(public readonly window: WindowWrapper) {
    super();
  }

  getKeys() {
    return this.getParams().keys();
  }

  get(key: string): unknown {
    const params = this.getParams();
    const value = params?.get(key);
    if (value == null) {
      return null;
    }

    if (isJson(value)) {
      return JSON.parse(value);
    }
    return value;
  }

  set(key: string, val: unknown): void {
    let raw = toStringOrJsonString(val);

    if (raw == null) {
      return;
    }

    // Get current state from URL
    const params = this.getParams();
    params.set(key, raw);

    // Write back to url.
    this.setParams(params);
  }
}

export function isJson(value: string) {
  return /^["\\|\\{]/.test(value);
}

export function toStringOrJsonString(value: unknown) {
  let raw: string | undefined;

  if (typeof value === 'string') {
    raw = value;
  } else if (typeof value === 'number') {
    raw = value.toString();
  } else if (typeof value === 'boolean') {
    raw = value.toString();
  } else if (typeof value === 'object') {
    raw = JSON.stringify(value);
  }
  return raw;
}
