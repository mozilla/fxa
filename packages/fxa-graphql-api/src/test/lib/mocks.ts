/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from 'mozlog';
import { stubInterface } from 'ts-sinon';
import { DataSources } from '../../lib/server';
import { AuthServerSource } from '../../lib/datasources/authServer';

export function mockContext(dataSources?: DataSources) {
  const ds = dataSources ?? { authAPI: stubInterface<AuthServerSource>() };
  return {
    authUser: '',
    token: 'test',
    logger: stubInterface<Logger>(),
    dataSources: ds,
  };
}
