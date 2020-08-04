/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Logger } from 'mozlog';
import { stubInterface } from 'ts-sinon';

import { AuthServerSource } from '../../lib/datasources/authServer';
import { ProfileServerSource } from '../../lib/datasources/profileServer';

export function mockContext() {
  const ds = {
    authAPI: stubInterface<AuthServerSource>(),
    profileAPI: stubInterface<ProfileServerSource>(),
  };
  return {
    session: {
      uid: '',
      state: 'unverified',
    },
    token: 'test',
    logger: stubInterface<Logger>(),
    dataSources: ds,
  };
}
