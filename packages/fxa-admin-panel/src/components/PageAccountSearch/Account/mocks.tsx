/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MockedResponse } from '@apollo/client/testing';
import { UNSUBSCRIBE_FROM_MAILING_LISTS } from '../DangerZone';

export const mockUnsubscribe = (success: boolean): MockedResponse => {
  const request = {
    query: UNSUBSCRIBE_FROM_MAILING_LISTS,
  };

  let result = undefined;
  let error = undefined;
  if (success) {
    result = {
      data: {
        status: success,
      },
    };
  } else {
    error = new Error('Unsubscribe failed.');
  }

  return {
    request,
    result,
    error,
  };
};
