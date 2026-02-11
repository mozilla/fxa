/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MetricsContext } from './index';

export class LoginEvent {
  constructor(
    public clientId: string,
    public event: string,
    public ts: number,
    public metricsContext: MetricsContext,
    public service: string,
    public uid: string,
    public email: string,
    public deviceCount: number,
    public userAgent: string
  ) {}
}
