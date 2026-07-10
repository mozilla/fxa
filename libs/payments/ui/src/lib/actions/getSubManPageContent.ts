/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use server';

import { requireSessionUid } from '@fxa/payments/ui-auth';
import { getApp } from '../nestapp/app';
import { flattenRouteParams } from '../utils/flatParam';
import { getAdditionalRequestArgs } from '../utils/getAdditionalRequestArgs';

export const getSubManPageContentAction = async (
  params: Record<string, string | string[] | undefined>,
  searchParams: Record<string, string | string[] | undefined>,
  acceptLanguage?: string | null,
  selectedLanguage?: string
) => {
  const uid = await requireSessionUid();
  const requestArgs = {
    ...(await getAdditionalRequestArgs()),
    params: flattenRouteParams(params),
    searchParams: flattenRouteParams(searchParams),
  };

  const result = await getApp()
    .getActionsService()
    .getSubManPageContent({
      uid,
      requestArgs,
      acceptLanguage,
      selectedLanguage,
    });

  return result;
};
