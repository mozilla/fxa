/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CompleteResetPasswordLink } from './complete-reset-password-link';
import { ReachRouterWindow } from '../../../lib/window';
import { UrlQueryData } from '../../../lib/model-data';

export function CreateCompleteResetPasswordLink() {
  // TODO: make `urlQueryData` available via Context or modify and return
  // from the `useIntegration` hook
  const urlQueryData = new UrlQueryData(new ReachRouterWindow());

  return new CompleteResetPasswordLink(urlQueryData);
}
