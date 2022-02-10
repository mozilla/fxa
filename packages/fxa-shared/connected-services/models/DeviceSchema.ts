/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Location } from './Location';

export type DeviceSchema = {
  id: string;
  location: Location;
  name: string;
  nameResponse: string;
  type: string;
  pushCallback: string;
  pushPublicKey: string;
  pushAuthKey: string;
  pushEndpointExpired: boolean;
  availableCommands: Record<string, string>;
};
