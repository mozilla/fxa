/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use server';

import { getApp } from '../nestapp/app';

export const getTaxAddressAction = async (ipAddress: string, uid?: string) => {
  const { result } = await getApp().getActionsService().getTaxAddress({ ipAddress, uid });

  return result;
};
