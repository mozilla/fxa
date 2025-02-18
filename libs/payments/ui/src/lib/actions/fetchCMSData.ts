/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { plainToClass } from 'class-transformer';
import { getApp } from '../nestapp/app';
import { FetchCMSDataArgs } from '../nestapp/validators/FetchCMSDataArgs';

export const fetchCMSData = (
  offeringId: string,
  acceptLanguage?: string | null,
  selectedLanguage?: string
) => {
  return getApp().getActionsService().fetchCMSData(
    plainToClass(FetchCMSDataArgs, {
      offeringId,
      acceptLanguage,
      selectedLanguage,
    })
  );
};
