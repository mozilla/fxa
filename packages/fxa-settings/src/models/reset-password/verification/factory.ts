/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useContext } from 'react';
import { AppContext } from '../../AppContext';
import { CompleteResetPasswordLink } from './complete-reset-password-link';

export function CreateCompleteResetPasswordLink() {
  const { urlQueryData } = useContext(AppContext);

  if (urlQueryData == null) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }

  return new CompleteResetPasswordLink(urlQueryData);
}
