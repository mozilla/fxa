/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import createClient from 'openapi-fetch';
import { components, paths } from './identity-schema';

import { DB } from '../../lib/db';
import { ERRNO } from '../../lib/error';
import * as pbkdf2 from '../../lib/crypto/pbkdf2';
import PasswordFn from '../../lib/crypto/password';
import hkdf from '../../lib/crypto/hkdf';
import {
  parseSalt,
  V1_PBKDF2_ITERATIONS,
  V2_PBKDF2_ITERATIONS,
} from '../../lib/routes/utils/client-key-stretch';

// the generated schema is failing us a bit so here we define the type of the
// objects in 'identities' of the search results
export type SearchResultIdentity = Required<
  Pick<components['schemas']['DomainLogin'], 'login' | 'domain'>
>;

export const defaultPerPageLimit = 500;

// the Recorded Future Identity OpenAPI definition does not include any
// response information aside from the http 200 response.  it appears that the
// error can be a string or an object with a 'message' string property (but
// it's not an Error instance)
export const createRecordedFutureRespError = (error) =>
  new Error(
    `Recorded Future credentials search error: ${(error as any).message ?? error}`,
    { cause: error }
  );

export const createCredentialsSearchFn =
  (client: ReturnType<typeof createClient<paths>>) =>
  async (payload: components['schemas']['CredentialsSearchRequest']) => {
    const { error, data } = await client.POST('/identity/credentials/search', {
      body: payload,
    });
    if (error) {
      throw createRecordedFutureRespError(error);
    }

    return data;
  };

export const fetchAllCredentialSearchResults = async (
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

export const createCredentialsLookupFn =
  (client: ReturnType<typeof createClient<paths>>) =>
  async (
    logins: SearchResultIdentity[],
    filter: components['schemas']['CredentialsLookupRequest']['filter']
  ) => {
    /**
     * Note that there is an inconsistency/discrepancy between the API and the
     * docs.  When a list of `subjects_login` is passed, all the results will
     * be returned, even when there are over 500 items in the list.
     *
     * Since the input size is based on the results of the search results, it's
     * unknown, so we'll chop up the list ourselves.
     */

    // each identity could have >1 credentials.  collect into an array of
    // credentials and filter for cleartext secret
    const credentialsWithCleartextSecret: components['schemas']['Credentials'][] =
      [];
    for (let i = 0; i < logins.length; i += defaultPerPageLimit) {
      const subjectLogins = logins.slice(i, i + defaultPerPageLimit);
      const { error, data } = await client.POST(
        '/identity/credentials/lookup',
        {
          body: {
            subjects_login: subjectLogins,
            filter,
          },
        }
      );

      if (error) {
        throw createRecordedFutureRespError(error);
      }

      for (const identity of data.identities || []) {
        const cleartextSecretCreds = identity.credentials?.filter(
          (id) => id.exposed_secret?.type === 'clear'
        );

        // the same combination of login and password could show up due to
        // different leak sources
        const creds = new Map();
        cleartextSecretCreds?.forEach((x) =>
          creds.set(
            `${x.subject}${x.exposed_secret?.details?.clear_text_value}`,
            x
          )
        );

        credentialsWithCleartextSecret.push(...creds.values());
      }
    }

    return credentialsWithCleartextSecret;
  };

export const getCredentials = async (
  account: Awaited<ReturnType<ReturnType<typeof createFindAccountFn>>>,
  password: string
) => {
  // if key stretching v2 values are present then we just do that
  const { iterations, salt } = (() => {
    const saltInfo = account?.clientSalt
      ? parseSalt(account?.clientSalt)
      : null;
    if (
      account?.verifyHashVersion2 &&
      account?.wrapWrapKbVersion2 &&
      saltInfo?.version === 2
    ) {
      return { iterations: V2_PBKDF2_ITERATIONS, salt: saltInfo.value };
    }
    return {
      iterations: V1_PBKDF2_ITERATIONS,
      salt: account?.normalizedEmail,
    };
  })();
  const stretch = await pbkdf2.derive(
    Buffer.from(password),
    hkdf.KWE('quickStretch', salt),
    iterations,
    32
  );
  const authPW = await hkdf(stretch, 'authPW', null, 32);
  const unwrapBKey = await hkdf(stretch, 'unwrapBKey', null, 32);
  return { authPW, unwrapBKey };
};

export const createVerifyPasswordFn =
  (
    Password: ReturnType<typeof PasswordFn>,
    checkPasswordFn: DB['checkPassword'],
    getCredentialsFn: typeof getCredentials = getCredentials // param is mainly for testing
  ) =>
  async (
    foundCredentials: components['schemas']['Credentials'],
    account: Awaited<ReturnType<ReturnType<typeof createFindAccountFn>>>
  ) => {
    const fxaCredentials = await getCredentialsFn(
      account,
      foundCredentials.exposed_secret?.details?.clear_text_value as string
    );
    const password = new Password(
      fxaCredentials.authPW,
      account?.authSalt,
      account?.verifierVersion
    );
    const verifyHash = await password.verifyHash();
    const passwordCheck = await checkPasswordFn(
      account?.uid as string,
      verifyHash
    );

    return passwordCheck.match;
  };
