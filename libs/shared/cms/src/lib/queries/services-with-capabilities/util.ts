/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ServiceResult, ServicesWithCapabilitiesResult } from './types';

export class ServicesWithCapabilitiesResultUtil {
  constructor(private rawResult: ServicesWithCapabilitiesResult) {}

  getServices(): ServiceResult[] {
    return this.services;
  }

  get services() {
    return this.rawResult.services;
  }
}
