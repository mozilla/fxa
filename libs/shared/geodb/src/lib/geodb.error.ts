/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseError } from '@fxa/shared/error';

/**
 * GeoDBError is not intended for direct use, except for type-checking errors.
 * When throwing a new GeoDBError, create a unique extension of the class.
 */
export class GeoDBError extends BaseError {
  constructor(message: string, info: Record<string, any>, cause?: Error) {
    super(message, { info, cause });
    this.name = 'GeoDBError';
  }
}

export class GeoDBInvalidIp extends GeoDBError {
  constructor() {
    super('IP is invalid', {});
    this.name = 'GeoDBInvalidIp';
  }
}

export class GeoDBFetchDataFailed extends GeoDBError {
  constructor() {
    super('Unable to fetch data', {});
    this.name = 'GeoDBFetchDataFailed';
  }
}
