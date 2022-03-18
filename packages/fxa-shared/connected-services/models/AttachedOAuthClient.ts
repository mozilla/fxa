/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type AttachedOAuthClient = {
  refresh_token_id: string;
  created_time: number;
  last_access_time: number;
  scope: string[] | null;
  client_id: string | null;
  client_name: string | null;
};
