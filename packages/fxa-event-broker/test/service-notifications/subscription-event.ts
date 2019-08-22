/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MetricsContext } from './index';

export class SubscriptionEvent {
  constructor(
    public event: string,
    public ts: number,
    public metricsContext: MetricsContext,
    public subscriptionId: string,
    public uid: string,
    public isActive: boolean,
    public productId: string,
    public productCapabilities: string[]
  ) {}
}
