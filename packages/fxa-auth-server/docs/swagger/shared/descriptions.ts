/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import dedent from 'dedent';

const DESCRIPTIONS = {
  accessToken:
    "An OAuth access token that the client can use for authorized requests to service providers to access data associated with the user's account.",
  accessType:
    'If specified, a value of `offline` will cause the connecting client to be granted a refresh token alongside its access token.',
  acrValues:
    'A space-separated list of ACR values specifying acceptable levels of user authentication that the token should have a claim for. Specifying `AAL2` will require the token to have an authentication assuarance level >= 2 which ensures that the user has been authenticated with 2FA before authorizing the requested grant.',
  active: 'Boolean indicator of whether the presented token is active.',
  activePrice:
    'Whether the price can be used for new purchases. Defaults to true.',
  amount:
    'Amount intended to be collected. A positive integer representing how much to charge in the smallest currency unit (e.g. 100 cents to charge $1.00 or 100 to charge ¥100, a zero-decimal currency).',
  assertion: 'A FxA assertion for the signed-in user.',
  atLeast18AtReg:
    'True if age submitted at signup is equal or higher than 18, otherwise null if >18, account created before this column was added or if COPPA is disabled. Used by some relying parties to verify if they need to perform another age check.',
  authAt:
    'The UTC unix timestamp for the session at which the user last authenticated to FxA server when generating this token, in seconds since the epoch.',
  authPW: 'The PBKDF2/HKDF-stretched password as a hex string.',
  authPWVersion2:
    'The PBKDF2/HKDF-stretched password as a hex string using the version 2 key stretching.',
  billingAgreementId: 'A unique identifier for the PayPal billing agreement.',
  billingName: 'Full name',
  brand:
    'Card brand (e.g. `amex`, `diners`, `discover`, `jcb`, `mastercard`, `unionpay`, `visa`, or `unknown`).',
  bundle:
    'See [**decrypting the bundle**](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol#Decrypting_the_getToken2_Response) for information on how to extract kA|wrapKb from the bundle.',
  cancelAtPeriodEnd:
    'True if the subscription will not automatically renew at the end of the current billing period. Else false.',
  cancelledAt:
    'If the subscription has been canceled, the date of that cancellation. If the subscription was canceled with `cancel_at_period_end`, `canceled_at` will reflect the time of the most recent update request, not the end of the subscription period when the subscription is automatically moved to a canceled state.',
  capabilities:
    'An array of RP-defined strings that represent a certain level of access to their product/service.',
  clientId:
    'The OAuth client identifier for the requesting client application (provided by the connecting client application)',
  clientIdPermission: ' asking for permission.',
  clientIdRegistration: ' returned from client registration.',
  clientIdToDelete: ' whose tokens should be deleted.',
  clientName: 'The string name of the client.',
  clientSalt:
    'The salt used when creating authPW. If not provided, it will be assumed that version one of the password encryption scheme was used.',
  clientSecret:
    'The OAuth client secret for the requesting client application. Required for confidential clients, forbidden for public clients.',
  code: 'Time based code to verify secondary email',
  codeOauth:
    'A string that the client will trade with the [token][] endpoint. Codes have a configurable expiration value, default is 15 minutes. Codes are single use only.',
  codeChallenge:
    'Required for public OAuth clients, who must authenticate their authorization code use via [**PKCE**](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/fxa-oauth-server/docs/pkce.md). A minimum length of 43 characters and a maximum length of 128 characters string, encoded as `BASE64URL`.',
  codeChallengeMethod: `Required for public OAuth clients, who must authenticate their authorization code use via [**PKCE**](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/fxa-oauth-server/docs/pkce.md). The only support method is 'S256', no other value is accepted.`,
  codeRecovery: "The code sent to the user's recovery email.",
  codeTotp: 'The TOTP code to check',
  codeVerifier:
    'The [PKCE](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/oauth/pkce.md) code verifier. Required for public clients, forbidden otherwise.',
  command:
    "The id of the command to be invoked, as found in the device's availableCommands set.",
  createdAt: 'This is the date the subscription was created.',
  createdTime: 'Integer time of token creation.',
  currency: 'The three-letter ISO currency code, in lowercase.',
  currencyCode: 'The three-letter ISO currency code, in uppercase.',
  currentPeriodEnd: 'This is the end date of the current billing cycle.',
  currentPeriodStart: 'This is the start date of the current billing cycle.',
  customerId:
    'A unique identifier for the Stripe/PayPal [customer](https://stripe.com/docs/api/customers/object).',
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
  exp: 'Integer time of token expiration.',
  expMonth: "Two-digit number representing the card's expiration month.",
  expYear: "Four-digit number representing the card's expiration year.",
  expiresIn: 'The number of seconds until the access token will expire.',
  failureCode:
    'Reason for the failure (e.g. insufficient funds, closed, frozen).',
  failureMessage: dedent`
    Message from Stripe for the client making the request to further explain the reason for top-up failure if available.

    For more information about failure codes and messages from Stripe to the client, see [Stripe docs](https://stripe.com/docs/api/errors). It is suggested that the [error type](https://stripe.com/docs/api/errors#errors-message) of \`type: card_error\` is shown directly to the customer.
  `,
  filterIdleDevicesTimestamp:
    'Filter device list to only show devices active since UTC timestamp.',
  'fxa-lastUsedAt': ' Integer time when this token is last used.',
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
  grantTypeOauth: dedent`
    - If \`authorization_code\`:
      - \`client_id\`: The id returned from client registration.
      - \`client_secret\`: The secret returned from client registration. Forbidden for public clients, required otherwise.
      - \`code\`: A string that was received from the [authorization][] endpoint.
      - \`code_verifier\`: The [PKCE](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/oauth/pkce.md) code verifier. Required for public clients, forbidden otherwise.
    - If \`refresh_token\`:
      - \`client_id\`: The id returned from client registration.
      - \`client_secret\`: The secret returned from client registration. Forbidden for public (PKCE) clients, required otherwise.
      - \`refresh_token\`: A string that received from the [token][] endpoint specifically as a refresh token.
      - \`scope\`: (optional) A subset of scopes provided to this refresh_token originally, to receive an access_token with less permissions.
    - If \`fxa-credentials\`:
      - \`client_id\`: The id returned from client registration.
      - \`assertion\`: FxA identity assertion authenticating the user.
      - \`scope\`: (optional) A string-separated list of scopes to be authorized.
      - \`access_type\`: (optional) Determines whether to generate a \`refresh_token\` (if \`offline\`) or not (if \`online\`).
  `,
  iat: 'Integer time of token creation.',
  idempotencyKey:
    'The idempotency key transmitted during the request, if any. For more information, see [Stripe docs](https://stripe.com/docs/error-low-level#idempotency)',
  idToken:
    'OpenID Connect identity token, provisioned if the authorization was requested with `openid` scope.',
  imageUri: 'A url to a logo or image that represents the client.',
  indexQuery:
    'The index of the most recently seen command item. Only commands enqueued after the given index will be returned.',
  indexSchema:
    'The largest index of the commands returned in this response. This value can be passed as the index parameter in subsequent calls in order to page through all the items.',
  interval:
    'The frequency at which a subscription is billed (e.g. day, week, month, year).',
  intervalCount:
    'The number of intervals between subscription billings (e.g. `interval=month` and `interval_count=3` bills every 3 months).',
  invoiceId:
    'A unique identifer for an [invoice](https://stripe.com/docs/api/invoices/object) to Stripe/PayPal customers whose subscriptions are managed by Stripe.',
  jti: 'The hex id of the token.',
  keys: 'Indicates whether a key-fetch token should be returned in the success response.',
  keysJwe:
    'An encrypted JWE bundle of key material, to be returned to the client when it redeems the authorization code.',
  keysJweOauth:
    'Returns the JWE bundle of key material for any scopes that have keys, if `grant_type=authorization_code`',
  last: 'Indicates whether more commands and enqueued than could be returned within the specific limit.',
  last4: 'The last four digits of the card.',
  lastAccessTime: 'Integer last-access time for the token.',
  latestInvoice:
    'The most recent invoice this subscription has generated from Stripe.',
  limit:
    'The maximum number of commands to return. The default and maximum value for limit is 100.',
  location: "Object containing the client's state and country",
  messages: 'An array of individual commands for the device to process.',
  name: 'A string name of the client.',
  originalLoginEmail:
    'This parameter is the original email used to login with. Typically, it is specified after a user logins with a different email case, or changed their primary email address.',
  queryKeys:
    'Indicates whether a new `keyFetchToken` is required, default to `false`.',
  payload: 'Opaque payload to be forwarded to the device.',
  paymentMethodId:
    'A unique identifier for the payment method in Stripe; does not apply to IAP subscriptions.',
  paymentProvider: 'The payment processors (e.g. PayPal, Stripe).',
  paymentType:
    'The type of the payment method (e.g., `credit`, `debit`, `prepaid`, or `unknown`).',
  paypalPaymentError: 'The payment error from PayPal encountered.',
  planId:
    'A unique identifier for the [plan](https://stripe.com/docs/api/plans/object).',
  planMetadata:
    'Set of key-value pairs used to store additional information about the plan. For more information, see [Ecosystem Platform](https://mozilla.github.io/ecosystem-platform/tutorials/subscription-platform#stripe-plan-metadata)',
  planName: 'The name of the plan.',
  ppidSeed:
    'Seed used in `sub` claim generation of JWT access tokens/ID tokens for clients with [Pseudonymous Pairwise Identifiers (PPID)](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/oauth/pairwise-pseudonymous-identifiers.md) enabled. Used to forcibly rotate the `sub` claim. Must be an integer in the range 0-1024. If not specified, it will default to `0`.',
  previousProduct: 'The previous product name.',
  priceId:
    'A unique identifier for the [price](https://stripe.com/docs/api/prices/object).',
  productId:
    'A unique identifier for the [product](https://stripe.com/docs/api/products/object) purchased.',
  productMetadata:
    'Set of key-value pairs used to store additional information about the product. For more information, see [Ecosystem Platform](https://mozilla.github.io/ecosystem-platform/tutorials/subscription-platform#stripe-product-metadata)',
  productName: 'The name of the product purchased.',
  promotionCode: 'A customer-redeemable code for a coupon.',
  promotionDuration: 'Indicates how long the coupon is valid for.',
  promotionId: 'The id associated with the promotion code',
  providerUid: 'The user id associated with a particular third party provider.',
  publicKey:
    'The key to sign (run bin/generate-keypair from [**browserid-crypto**](https://github.com/mozilla/browserid-crypto)).',
  pushPayload:
    'Push payload, validated against [**pushpayloads.schema.json**](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/lib/pushpayloads.schema.json).',
  reason:
    'Alphanumeric string indicating the reason for establishing a new session; may be "login" (the default) or "reconnect".',
  recoveryData: "An encrypted bundle containing the user's kB.",
  recoveryKeyHint:
    'A string containing a user-defined hint to help them remember where they stored their account recovery key.',
  recoveryKeyId:
    'A unique identifier for this account recovery key, derived from the key via HKDF.',
  redirectTo:
    'URL that the client should be redirected to after handling the request.',
  redirectUri:
    'The URI at which the connecting client expects to receive the authorization code and redirect to after a successful oauth. If supplied, this must match the URL value provided during OAuth client registration.',
  refreshToken:
    'A token that can be used to grant a new access token when the current one expires, via `grant_type=refresh_token` on this endpoint.',
  refreshTokenOauth: dedent`
    A refresh token to fetch a new access token when this one expires. Only present if:

    - \`grant_type=authorization_code\` and the original authorization request included \`access_type=offline\`.
    - \`grant_type=fxa-credentials\` and the request included \`access_type=offline\`.
  `,
  refreshTokenId: 'The specific `refresh_token_id` to be destroyed.',
  reminder: 'Indicates that verification originates from a reminder email.',
  resource:
    'Indicates the target service or resource at which access is being requested. Its value must be an absolute URI, and may include a query component but must not include a fragment component. Added to the `aud` claim of JWT access tokens.',
  resourceOauth:
    ' Optional if `response_type=token`, forbidden if `response_type=code`.',
  responseType:
    "Determines the format of the response. Since we only support the authorization-code grant flow, the only permitted value is 'code'.",
  responseTypeOauth: dedent`
    If supplied, must be either code or token. code is the default. token means the implicit grant is desired, and requires that the client have special permission to do so.

    - Note: new implementations should not use \`response_type=token\`; instead use \`grant_type=fxa-credentials\` at the [token][] endpoint.
  `,
  resume:
    'Opaque URL-encoded string to be included in the verification link as a query parameter.',
  scope:
    'A space-separated list of scope values that the user has authorized, or is held by the granted access token that the connecting client will be granted. The requested scope will be provided by the connecting client as part of its authorization request, but may be pruned by the user in a confirmation dialog before being sent to this endpoint.',
  sendVerifyEmail:
    'Boolean indicating whether a verification email should be sent.',
  service: 'Opaque alphanumeric token to be included in verification links.',
  serviceRP:
    'Identifies the relying service the user was interacting with that triggered the password reset.',
  sessionToken:
    'Indicates whether a new `sessionToken` is required, default to `false`.',
  state:
    'An opaque string value provided by the connecting client application, which will be returned unmodified upon redirection alongside the authorization code. This can be used by the connecting client guard against certain classes of attack in the redirect-based OAuth flow to verify that the redirect is authentic.',
  status:
    'The status of the product (e.g. `active`, `canceled`, `trialing`, `unpaid`, etc).',
  sub: 'The hex id of the user.',
  subscriptionId:
    'A unique identifier for the Stripe [subscription](https://stripe.com/docs/api/subscriptions/object).',
  subscriptions: 'A list of all subscriptions (including web and IAP).',
  target: 'The id of the device on which to invoke the command.',
  to: "Devices to notify. String `'all'` or an array containing the relevant device ids.",
  token:
    'The token to be revoked. If the specific token does not exist then this call will silently succeed.',
  tokenOauth: 'An OAuth token string received from a client for the user',
  tokenType:
    'The type of token, which determines how the client should use it in subsequent requests. Currently only Bearer tokens are supported.',
  tokenTypeOauth:
    'A string representing the token type. It will be `access_token` or `refresh_token`',
  tokenTypeHint:
    'A hint as to what type of token is being revoked. Expected values are "access_token" or "refresh_token", Unrecognized values will be silently ignored, and specifying an incorrect hint may cause to the request to take longer but will still result in the token being destroyed.',
  trusted: 'Whether the client is a trusted internal application.',
  ttl: 'The time in milliseconds after which the command should expire, if not processed by the device.',
  ttlOauth:
    'Indicates the requested lifespan in seconds for the `access_token` or implicit grant token. If unspecified, the value will default to an internal maximum limit allowed by the server, which is a configurable option, so clients must check the `expires_in` result property for the actual TTL - it is typically measured in minutes or hours.',
  ttlOauthPostAuth:
    ' Optional if `response_type=token`, forbidden if `response_type=code`.',
  ttlPushNotification: 'Push notification TTL, defaults to `0`.',
  ttlValidate:
    'The desired lifetime of the issued access token, in seconds. The actual lifetime may be smaller than requested depending on server configuration, and will be returned in the `expired_in` property of the response.',
  type: 'The type of code being verified.',
  uid: 'The user id.',
  unblockCode: 'Alphanumeric code used to unblock certain rate-limitings.',
  user: 'The uid of the respective user.',
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
  wrapKbVersion2: 'The new `wrapKb` value for authPW2 as a hex string.',
};

export default DESCRIPTIONS;
