/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type SerializableAttachedClient = {
  client_id: string;
  refresh_token_id: string;
  client_name: string;
  created_time: number;
  last_access_time: number;
  scope: string[];
};
