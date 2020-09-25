/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/// <reference types="react-scripts" />

type hexstring = string;

type Hash<T> = { [key: string]: T };

type Resolved<T> = T extends PromiseLike<infer U> ? U : T;

interface FlowQueryParams {
  broker?: string;
  context?: string;
  deviceId?: string;
  flowBeginTime?: number;
  flowId?: string;
  isSampledUser?: boolean;
  service?: string;
  uniqueUserId?: string;
}
