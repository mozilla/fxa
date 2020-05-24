/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const AppError = require('./error');
const jwt = require('./jwt');
const logger = require('./logging')('jwt_id_token');

/**
 * Verify the Expiration Time ('exp') claim value from an ID Token.
 *
 * This function was extracted into a helper to ease unit testing,
 * because jsonwebtoken won't sign a token with an invalid data type
 * for the 'exp' claim.
 *
 * @param {Any} exp
 * @returns {Boolean} whether the value is a valid number
 */
exports._isValidExp = (exp) => {
  return typeof exp === 'number' && !isNaN(exp);
};

/**
 * Verify an OIDC ID Token, following the flow in 3.1.3.7 of the spec:
 * https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation
 *
 * This token verification flow is normally used by relying parties to validate
 * tokens provided by the OpenID Provider. In this case, we (the OpenID
 * Provider) use it to validate an ID Token passed in by a relying party, as an
 * id_login_hint. Some steps in the flow don't apply to our use case, and are
 * skipped. All steps in the flow are indicated in comments, to hopefully
 * ease future maintenance.
 *
 * Our ID Tokens are short-lived by default (5 minutes), but for some
 * applications, a recently-expired token could be acceptable. The
 * optional `expiryGracePeriod` argument allows this grace period to be
 * specified in seconds.
 *
 * @param {String} idToken
 * @param {String} clientId
 * @param {Number} expiryGracePeriod - number of **seconds** past the
 * token expiration ('exp' claim value) for which the token will be treated
 * as valid.
 *
 * @throws `invalidToken` error if ID Token is invalid.
 * @returns {Promise<Object>} resolves with claims in Token
 */
exports.verify = async function verify(
  idToken,
  clientId,
  expiryGracePeriod = 0
) {
  // Step 1 is skipped, as we don't support JWE tokens.
  //
  // 1. If the ID Token is encrypted, decrypt it using the keys and algorithms
  //    that the Client specified during Registration that the OP was to use to
  //    encrypt the ID Token. If encryption was negotiated with the OP at
  //    Registration time and the ID Token is not encrypted, the RP SHOULD
  //    reject it.

  // Step 2 is handled by the `jwt.verify()` function.
  //
  // 2. The Issuer Identifier for the OpenID Provider MUST exactly match the
  //    value of the `iss` (issuer) Claim.
  let claims;
  try {
    claims = await jwt.verify(idToken, { ignoreExpiration: true });
  } catch (err) {
    logger.debug('verify.error.jwtverify', err);
    throw AppError.invalidToken();
  }

  // For Step 3, we just need to verify the audience claim matches the
  // clientId. FxA controls the list of relying parties, so there's no chance
  // an untrusted audience could be present.
  //
  // 3. The Client MUST validate that the aud (audience) Claim contains its
  //    client_id value registered at the Issuer identified by the iss (issuer)
  //    Claim as an audience. The aud (audience) Claim MAY contain an array
  //    with more than one element. The ID Token MUST be rejected if the ID
  //    Token does not list the Client as a valid audience, or if it contains
  //    additional audiences not trusted by the Client.
  if (typeof claims.aud === 'string' && claims.aud !== clientId) {
    logger.debug('verify.error.aud', { aud: claims.aud, clientId });
    throw AppError.invalidToken();
  } else if (!claims.aud.includes(clientId)) {
    logger.debug('verify.error.aud', { aud: claims.aud, clientId });
    throw AppError.invalidToken();
  }

  // Steps 4 and 5 are skipped, because FxA doesn't support the Authorized
  // Party (azp) Claim.
  //
  // 4. If the ID Token contains multiple audiences, the Client SHOULD verify
  //    that an 'azp' field is present.
  // 5. If an 'azp' Claim is present, the Client SHOULD verify that its
  //    client_id is the Claim Value.

  // Step 6 is skipped, because it doesn't apply to our use case.
  //
  // 6. If the ID Token is received via direct communication between the Client
  //    and the Token Endpoint (which it is in this flow), the TLS server
  //    validation MAY be used to validate the issuer in place of checking the
  //    token signature. The Client MUST validate the signature of all other ID
  //    Tokens according to JWS using the algorithm specified in the JWT 'alg'
  //    Header Parameter. The Client MUST use the keys provided by the Issuer.

  // Step 7 is handled by the `jwt.verify()` function call above.
  //
  // 7. The 'alg' value SHOULD be the default of RS256 or the algorithm sent
  //    by the Client in the 'id_token_signed_response_alg' parameter during
  //    Registration.

  // Step 8 can be safely skipped for now, as FxA currently uses RS256.
  //
  // 8. If the JWT `alg` Header Parameter uses a MAC based algorithm such as
  //    `HS256`, `HS384`, or `HS512`, the octets of the UTF-8 representation of
  //    the `client_secret` corresponding to the `client_id` contained in the
  //    `aud` (audience) Claim are used as the key to validate the signature.
  //    For MAC based algorithms, the behavior is unspecified if the `aud` is
  //    multi-valued or if an `azp` value is present that is different than
  //    the `aud` value.

  // 9. The current time MUST be before the time represented by the `exp`
  //    Claim.
  //
  // Note that we optionally allow for expired tokens via the
  // `expiryGracePeriod` argument, so we have to do basic type checking of the
  // 'exp' claim value ourselves.
  //
  // Note also that this time is specified to be in seconds, not milliseconds.
  if (!exports._isValidExp(claims.exp)) {
    logger.debug('verify.error.exp', { exp: claims.exp });
    throw AppError.invalidToken();
  }

  const currentTime = Math.round(Date.now() / 1000);
  const fiveMinutesAhead = currentTime + 60 * 5;
  if (
    claims.exp > fiveMinutesAhead ||
    claims.exp + expiryGracePeriod < currentTime
  ) {
    logger.debug('verify.error.exp', {
      exp: claims.exp,
      expiryGracePeriod,
      currentTime,
    });
    throw AppError.invalidToken();
  }

  // The remaining steps don't apply to our use case, so they are skipped.
  //
  // 10. The `iat` claim can be used to reject tokens issued too far away from
  //     the current time, limiting the amount of time that nonces need to be
  //     stored to prevent attacks. The acceptable range is Client specific.
  //
  // 11. If a nonce value was sent in the Authentication Request, a `nonce`
  //     Claim MUST be present and its value checked to verify that it is the
  //     same value as the one that was sent in the Authentication Request.
  //     The Client SHOULD check the nonce value for replay attacks. The
  //     precise method for detecting replay attacks is Client specific.
  //
  // 12. If the `acr` Claim was requested, Client SHOULD check the asserted
  //     Claim Value is appropriate. The meaning and processing of `acr` Claim
  //     Values is out of scope for the OIDC spec.
  //
  // 13. If the `auth_time` Claim was requested, either specifically or by
  //     using the `max_age` parameter, the Client SHOULD check the `auth_time`
  //     Claim Value and request re-authentication if it determines too much
  //     time has elapsed since the last End-User authentication.
  return claims;
};
