/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BaseError } from '@fxa/shared/error';

export class GeoDBError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

export class GeoDBInvalidIp extends GeoDBError {
  constructor() {
    super('IP is invalid');
  }
}

export class GeoDBFetchDataFailed extends GeoDBError {
  constructor() {
    super('Unable to fetch data');
  }
}
