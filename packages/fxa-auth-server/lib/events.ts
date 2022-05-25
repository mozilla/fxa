/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import Emittery from 'emittery';

import { AuthRequest } from './types';

export type AuthServerEventMap = {
  'account:capabilitiesAdded': {
    uid: string;
    capabilities: string[];
    request?: AuthRequest;
    eventCreatedAt?: number;
  };
  'account:capabilitiesRemoved': {
    uid: string;
    capabilities: string[];
    request?: AuthRequest;
    eventCreatedAt?: number;
  };
};

export const authEvents = new Emittery<AuthServerEventMap>();
