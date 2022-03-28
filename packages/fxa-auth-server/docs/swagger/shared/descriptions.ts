/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';

const DESCRIPTIONS = {
  accessToken:
    "An OAuth access token that the client can use to access data associated with the user's account.",
  accessType:
    'If specified, a value of `offline` will cause the connecting client to be granted a refresh token alongside its access token.',
  acrValues:
    'A space-separated list of ACR values specifying acceptable levels of user authentication. Specifying `AAL2` will ensure that the user has been authenticated with 2FA before authorizing the requested grant.',
  authAt:
    'The timestamp for the session at which the user last authenticated to FxA, in seconds since the epoch.',
  authPW: 'The PBKDF2/HKDF-stretched password as a hex string.',
  bundle:
    'See [**decrypting the bundle**](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol#Decrypting_the_getToken2_Response) for information on how to extract kA|wrapKb from the bundle.',
  clientId:
    'The OAuth client identifier for the requesting client application (provided by the connecting client application).',
  clientSecret:
    'The OAuth client secret for the requesting client application. Required for confidential clients, forbidden for public clients.',
  code: 'Time based code to verify secondary email',
  codeChallenge:
    'Required for public OAuth clients, who must authenticate their authorization code use via [**PKCE**](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/fxa-oauth-server/docs/pkce.md).',
  codeChallengeMethod: `Required for public OAuth clients, who must authenticate their authorization code use via [**PKCE**](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/fxa-oauth-server/docs/pkce.md). The only support method is 'S256'.`,
  codeRecovery: "The code sent to the user's recovery email.",
  codeTotp: 'The TOTP code to check',
  command:
    "The id of the command to be invoked, as found in the device's availableCommands set.",
  customSessionToken: 'Custom session token id to destroy.',
  duration:
    'Time interval in milliseconds until the certificate will expire, up to a maximum of 24 hours.',
  email: 'The primary email for this account.',
  emailAdd: 'The email address to add to the account.',
  emailDelete: 'The email address to delete.',
  emailNewPrimary: 'The new primary email address of the user.',
  emailRecovery: 'Recovery email for the account.',
  emailSecondaryVerify: 'The secondary email address to verify.',
  excluded:
    'Array of device ids to exclude from the notification. Ignored unless `to:"all"` is specified.',
  expiresIn: 'The number of seconds until the access token will expire.',
  grantType: dedent`
    The type of grant flow being used. If not specified, it will default to fxa-credentials unless a code parameter is provided, in which case it will default to authorization_code. The value of this parameter determines which other parameters will be expected in the request body, as follows:
    - When \`grant_type=authorization_code\`:
      - \`code\`:  *validators.authorizationCode, required* The authorization code previously obtained through a redirect-based OAuth flow.
      - \`code_verifier\`: *validators.pkceCodeVerifier, optional* The [**PKCE**](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/fxa-oauth-server/docs/pkce.md) code verifier used when obtaining code. This is required for public OAuth clients, who must authenticate their authorization code use via PKCE.
      - \`redirect_uri\`: *string, URI, optional* The URI at which the client received the authorization code. If supplied this must match the value provided during OAuth client registration.
    - When \`grant_type=refresh_token\`:
      - \`refresh_token\`: *validators.refreshToken, required* A refresh token, as issued by a previous call to this endpoint.
      - \`scope\`: *string, optional* A space-separated list of scope values that will be held by the generated token. These must be a subset of the scopes originally granted when the refresh token was generated.
    - When \`grant_type=fxa-credentials\`:
      - \`scope\`: *string, optional* A space-separated list of scope values that will be held by the generated tokens.
      - \`access_type\`: *string, valid(online, offline), optional* If specified, a value of offline will cause the client to be granted a refresh token alongside its access token.
    -In addition, the request must be authenticated with a sessionToken.
  `,
  idToken:
    'Open OpenID Connect identity token, provisioned if the openid scope was requested.',
  indexQuery:
    'The index of the most recently seen command item. Only commands enqueued after the given index will be returned.',
  indexSchema:
    'The largest index of the commands returned in this response. This value can be passed as the index parameter in subsequent calls in order to page through all the items.',
  keys: 'Indicates whether a key-fetch token should be returned in the success response.',
  keysJwe:
    'An encrypted bundle of key material, to be returned to the client when it redeems the authorization code.',
  last: 'Indicates whether more commands and enqueued than could be returned within the specific limit.',
  limit:
    'The maximum number of commands to return. The default and maximum value for limit is 100.',
  location: "Object containing the client's state and country",
  messages: 'An array of individual commands for the device to process.',
  originalLoginEmail:
    'This parameter is the original email used to login with. Typically, it is specified after a user logins with a different email case, or changed their primary email address.',
  queryKeys:
    'Indicates whether a new `keyFetchToken` is required, default to `false`.',
  payload: 'Opaque payload to be forwarded to the device.',
  ppidSeed:
    'Seed used in sub claim generation of JWT access tokens/ID tokens for clients with [**Pseudonymous Pairwise Identifiers (PPID)**](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/oauth/pairwise-pseudonymous-identifiers.md) enabled. Used to forcibly rotate the `sub` claim. If not specified, it will default to `0`.',
  publicKey:
    'The key to sign (run bin/generate-keypair from [**browserid-crypto**](https://github.com/mozilla/browserid-crypto)).',
  pushPayload:
    'Push payload, validated against [**pushpayloads.schema.json**](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/lib/pushpayloads.schema.json).',
  reason:
    'Alphanumeric string indicating the reason for establishing a new session; may be "login" (the default) or "reconnect".',
  recoveryData: "An encrypted bundle containing the user's kB.",
  recoveryKeyId:
    'A unique identifier for this recovery key, derived from the key via HKDF.',
  redirectTo:
    'URL that the client should be redirected to after handling the request.',
  redirectUri:
    'The URI at which the connecting client expects to receive the authorization code. If supplied this must match the value provided during OAuth client registration.',
  refreshToken:
    'A token that can be used to grant a new access token when the current one expires, via `grant_type=refresh_token` on this endpoint.',
  reminder: 'Indicates that verification originates from a reminder email.',
  resource:
    'Indicates the target service or resource at which access is being requested. Its value must be an absolute URI, and may include a query component but must not include a fragment component. Added to the `aud` claim of JWT access tokens.',
  responseType:
    "Determines the format of the response. Since we only support the authorization-code grant flow, the only permitted value is 'code'.",
  resume:
    'Opaque URL-encoded string to be included in the verification link as a query parameter.',
  scope:
    'A space-separated list of scope values held by the granted access token that the connecting client will be granted. The requested scope will be provided by the connecting client as part of its authorization request, but may be pruned by the user in a confirmation dialog before being sent to this endpoint.',
  service: 'Opaque alphanumeric token to be included in verification links.',
  serviceRP:
    'Identifies the relying service the user was interacting with that triggered the password reset.',
  sessionToken:
    'Indicates whether a new `sessionToken` is required, default to `false`.',
  state:
    'An opaque string provided by the connecting client application, which will be returned unmodified alongside the authorization code. This can be used by the connecting client to guard against certain classes of attack in the redirect-based OAuth flow.',
  target: 'The id of the device on which to invoke the command.',
  to: "Devices to notify. String `'all'` or an array containing the relevant device ids.",
  token:
    'The token to be revoked. If the specific token does not exist then this call will silently succeed.',
  tokenType:
    'The type of token, which determins how the client should use it in subsequent requests. Currently only Bearer tokens are supported.',
  tokenTypeHint:
    'A hint as to what type of token is being revoked. Expected values are "access_token" or "refresh_token", Unrecognized values will be silently ignored, and specifying an incorrect hint may cause to the request to take longer but will still result in the token being destroyed.',
  ttl: 'The time in milliseconds after which the command should expire, if not processed by the device.',
  ttlPushNotification: 'Push notification TTL, defaults to `0`.',
  ttlValidate:
    'The desired lifetime of the issued access token, in seconds. The actual lifetime may be smaller than requested depending on server configuration, and will be returned in the `expired_in` property of the response.',
  type: 'The type of code being verified.',
  uid: 'The user id.',
  unblockCode: 'Alphanumeric code used to unblock certain rate-limitings.',
  verificationMethod: dedent`
    If this param is specified, it forces the login to be verified using the specified method.
    Currently supported methods:
    - \`email\`: Sends an email with a confirmation link.
    - \`email-2fa\`: Sends an email with a confirmation code.
    - \`email-captcha\`: Sends an email with an unblock code.
  `,
  verificationReason:
    'The authentication method that required additional verification.',
  wrapKb: 'The new `wrapKb` value as a hex string.',
};

export default DESCRIPTIONS;
