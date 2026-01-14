/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import config from './config';

export enum LegalDocFile {
  privacy = 'mozilla_accounts_privacy_notice',
  terms = 'firefox_cloud_services_tos',
}

export const fetchLegalMd = async (
  _unused: unknown, // Previously apolloClient, kept for backward compatibility
  locale: string,
  file: string
): Promise<{
  markdown?: string;
  error?: string;
}> => {
  const errorMsg = `Something went wrong. Try again later.`;

  try {
    // Fetch legal docs directly from GQL API
    const response = await fetch(`${config.servers.gql.url}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query GetLegalDoc($input: LegalInput!) {
            getLegalDoc(input: $input) {
              markdown
            }
          }
        `,
        variables: { input: { locale, file } },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch legal doc');
    }

    const result = await response.json();

    if (result?.data?.getLegalDoc?.markdown) {
      return {
        markdown: result.data.getLegalDoc.markdown,
      };
    }

    // If the markdown we got back is empty / invalid error out.
    throw new Error(errorMsg);
  } catch (err) {
    return {
      error: errorMsg,
    };
  }
};
