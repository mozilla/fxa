/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { V1_WIDTHS } from '@fxa/accounts/passkey';
import { VirtualAuthenticator } from '@fxa/accounts/passkey/testing';
import { ERRNO } from '@fxa/accounts/errors';
import Config from '../../config';

import {
  createTestServer,
  TestServerInstance,
} from '../support/helpers/test-server';

const Client = require('../client')();

const password = 'pssssst';
const { rpId, allowedOrigins } = Config.getProperties().passkeys;
const origin = allowedOrigins[0];

let server: TestServerInstance;

beforeAll(async () => {
  // A salt that is not base64url must turn PRF off, not stop startup.
  server = await createTestServer({
    configOverrides: {
      mfa: { enabled: true, actions: ['passkey'] },
      passkeys: {
        enabled: true,
        registrationEnabled: true,
        authenticationEnabled: true,
        passwordlessSyncEnabled: true,
        prfSalt: 'not base64url!',
        requestPrfAtAuthentication: 'all',
      },
    },
  });
}, 120000);

afterAll(async () => {
  await server.stop();
});

describe('#integration - passkey wraps with a malformed PRF salt', () => {
  it('starts the server and refuses wrap writes as not enabled', async () => {
    const client = await Client.createAndVerify(
      server.publicUrl,
      server.uniqueEmail(),
      password,
      server.mailbox,
      { version: 'V2' }
    );
    const session = await client.api.Token.SessionToken.fromHex(
      client.sessionToken
    );

    await client.api.doRequest(
      'POST',
      `${client.api.baseURL}/mfa/otp/request`,
      session,
      { action: 'passkey' }
    );
    const code = await server.mailbox.waitForMfaCode(client.email);
    const { accessToken } = await client.api.doRequest(
      'POST',
      `${client.api.baseURL}/mfa/otp/verify`,
      session,
      { action: 'passkey', code }
    );

    const options = await client.api.doRequestWithBearerToken(
      'POST',
      `${client.api.baseURL}/passkey/registration/start`,
      accessToken,
      {}
    );
    const credential = VirtualAuthenticator.createCredential();
    const { credentialId } = await client.api.doRequestWithBearerToken(
      'POST',
      `${client.api.baseURL}/passkey/registration/finish`,
      accessToken,
      {
        response: VirtualAuthenticator.createAttestationResponse(credential, {
          challenge: options.challenge,
          origin,
          rpId,
        }),
        challenge: options.challenge,
      }
    );

    const { challenge } = await client.api.doRequest(
      'POST',
      `${client.api.baseURL}/passkey/authentication/start`,
      null,
      { keysRequired: true }
    );
    const { mfaToken } = await client.api.doRequest(
      'POST',
      `${client.api.baseURL}/passkey/authentication/finish`,
      null,
      {
        response: VirtualAuthenticator.createAssertionResponse(credential, {
          challenge,
          origin,
          rpId,
        }),
        challenge,
        keysRequired: true,
      }
    );

    const field = (bytes: number) =>
      Buffer.alloc(bytes, 0x11).toString('base64url');
    await expect(
      client.api.doRequestWithBearerToken(
        'POST',
        `${client.api.baseURL}/passkey/wraps`,
        mfaToken,
        {
          credentialId,
          kdfSalt: field(V1_WIDTHS.kdfSalt),
          keyWrapIv: field(V1_WIDTHS.keyWrapIv),
          wrappedKb: field(V1_WIDTHS.wrappedKb),
        }
      )
    ).rejects.toMatchObject({ code: 403, errno: ERRNO.FEATURE_NOT_ENABLED });
  });
});
