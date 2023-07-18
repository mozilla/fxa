/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReactElement } from 'react';
import {
  MOCK_ACCOUNT,
  createAppContext,
  createHistoryWithQuery,
  produceComponent,
} from '../models/mocks';
import { Account } from '../models';

export function renderStoryWithHistory(
  component: ReactElement,
  route: string,
  account: Account | undefined = MOCK_ACCOUNT as unknown as Account,
  queryParams?: string
) {
  const history = createHistoryWithQuery(route, queryParams);
  return produceComponent(
    component,
    { route, history },
    {
      ...createAppContext(history),
      account,
    }
  );
}
