/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ServiceResult, ServicesWithCapabilitiesResult } from './types';

export class ServicesWithCapabilitiesResultUtil {
  private readonly byClientId: ReadonlyMap<string, ServiceResult>;

  constructor(private rawResult: ServicesWithCapabilitiesResult) {
    const index = new Map<string, ServiceResult>();
    for (const service of this.rawResult.services ?? []) {
      if (!service?.oauthClientId) continue;
      index.set(service.oauthClientId.toLowerCase(), service);
    }
    this.byClientId = index;
  }

  getServices(): ServiceResult[] {
    return this.services;
  }

  get services() {
    return this.rawResult.services;
  }

  findServiceByClientId(clientId: string): ServiceResult | undefined {
    return this.byClientId.get(clientId.toLowerCase());
  }
}
