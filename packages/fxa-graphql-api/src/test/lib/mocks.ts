/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from 'mozlog';
import sinon from 'sinon';
import { stubInterface } from 'ts-sinon';

export function mockContext() {
  return {
    authUser: '',
    logAction: sinon.stub(),
    logger: stubInterface<Logger>()
  };
}
