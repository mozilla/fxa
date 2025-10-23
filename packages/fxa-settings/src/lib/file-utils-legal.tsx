/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ApolloClient } from '@apollo/client';
import { GET_LEGAL_DOC } from '../models';

export enum LegalDocFile {
  privacy = 'mozilla_accounts_privacy_notice',
  terms = 'firefox_cloud_services_tos',
}

export const fetchLegalMd = async (
  apolloClient: ApolloClient<object> | undefined,
  locale: string,
  file: string
): Promise<{
  markdown?: string;
  error?: string;
}> => {
  const error = `Something went wrong. Try again later.`;

  if (apolloClient == null) {
    console.error('No apolloClient provided.');
    return {
      error,
    };
  }

  try {
    const result = await apolloClient.query({
      query: GET_LEGAL_DOC,
      variables: { input: { locale, file } },
    });

    if (result?.data?.getLegalDoc?.markdown) {
      return {
        markdown: result.data.getLegalDoc?.markdown,
      };
    }

    // If the markdown we got back is empty / invalid error out.
    throw new Error(error);
  } catch (err) {
    return {
      error,
    };
  }
};
