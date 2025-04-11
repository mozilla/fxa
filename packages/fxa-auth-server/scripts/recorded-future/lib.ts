/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import createClient from 'openapi-fetch';
import { components, paths } from './identity-schema';

import { DB } from '../../lib/db';
import { ERRNO } from '../../lib/error';

// the generated schema is failing us a bit so here we define the type of the
// objects in 'identities' of the search results
export type SearchResultIdentity = { login: string; domain: string };

export const defaultPerPageLimit = 500;

export const createCredentialsSearchFn =
  (client: ReturnType<typeof createClient<paths>>) =>
  async (payload: components['schemas']['CredentialsSearchRequest']) => {
    const { error, data } = await client.POST('/identity/credentials/search', {
      body: payload,
    });
    if (error) {
      // the Recorded Future Identity OpenAPI definition does not include any
      // response information aside from the http 200 response
      throw new Error(`Recorded Future error response: ${error}`);
    }

    return data;
  };

export const fetchAllCredentialResults = async (
  searchFn: (
    payload: components['schemas']['CredentialsSearchRequest']
  ) =>
    | Promise<components['schemas']['SearchResponse']>
    | Promise<Promise<components['schemas']['SearchResponse']>>,
  payload: components['schemas']['CredentialsSearchRequest']
) => {
  let credentials: components['schemas']['SearchResponseIdentity'][] = [];
  let res: components['schemas']['SearchResponse'] | undefined;
  const searchPayload = {
    ...payload,
    limit: payload.limit ?? defaultPerPageLimit,
  };

  do {
    const reqPayload = {
      ...searchPayload,
      ...(res?.next_offset ? { offset: res.next_offset } : {}),
    };
    res = await searchFn(reqPayload);
    credentials = credentials.concat(res.identities ?? []);
  } while (res?.next_offset && res.count === searchPayload.limit);

  return credentials as unknown as SearchResultIdentity[];
};

export const isLoginAnEmailAddress = (identity: SearchResultIdentity) => {
  const re = new RegExp(/^\S+@\S+\.\S+$/);
  return re.test(identity.login);
};

export const createFindAccountFn =
  (accountFn: DB['accountRecord']) => async (email: string) => {
    try {
      const acct = await accountFn(email);
      return acct;
    } catch (err) {
      if (err.errno !== ERRNO.ACCOUNT_UNKNOWN) {
        throw err;
      }
    }
    return;
  };

export const createHasTotp2faFn =
  (totpTokenFn: DB['totpToken']) =>
  async (
    account: NonNullable<
      Awaited<ReturnType<ReturnType<typeof createFindAccountFn>>>
    >
  ) => {
    try {
      await totpTokenFn(account.uid);
      return true;
    } catch (err) {
      if (err.errno !== ERRNO.TOTP_TOKEN_NOT_FOUND) {
        throw err;
      }
    }

    return false;
  };
