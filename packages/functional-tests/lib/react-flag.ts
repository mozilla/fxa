/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseTarget } from './targets/base';

export function getReactFeatureFlagUrl(
  target: BaseTarget,
  path: string,
  params?: string
) {
  if (params) {
    return `${target.contentServerUrl}${path}?showReactApp=true&${params}`;
  } else {
    return `${target.contentServerUrl}${path}?showReactApp=true`;
  }
}
