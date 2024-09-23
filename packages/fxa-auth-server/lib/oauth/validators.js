/* eslint-disable no-useless-escape */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Joi from 'joi';

import ScopeSet from 'fxa-shared/oauth/scopes';
import * as authServerValidators from '../routes/validators';
import { config } from '../../config';

export const HEX_STRING = /^(?:[0-9a-f]{2})+$/;
export const B64URL_STRING = /^[A-Za-z0-9-_]+$/;
export const BASIC_AUTH_HEADER = /^Basic\s+([a-zA-Z0-9+=\/]+)$/i;

export const clientId = Joi.string()
  .length(config.get('oauthServer.unique.id') * 2) // hex = bytes*2
  .regex(HEX_STRING)
  .required();

export const clientSecret = Joi.string()
  .length(config.get('oauthServer.unique.clientSecret') * 2) // hex = bytes*2
  .regex(HEX_STRING)
  .required();

export const codeVerifier = Joi.string().min(43).max(128).regex(B64URL_STRING); // https://tools.ietf.org/html/rfc7636#section-4.1

export const token = Joi.string()
  .length(config.get('oauthServer.unique.token') * 2)
  .regex(HEX_STRING);

export const sessionTokenId = authServerValidators.sessionTokenId;
export const sessionToken = authServerValidators.sessionToken;

const scopeString = Joi.string().max(256);

export const scope = Joi.extend({
  type: 'scope',
  base: Joi.any(), // We're not returning a string, so don't base this on Joi.string().
  messages: {
    base: 'needs to be a valid scope string',
  },
  prepare(value, state, options) {
    const err = scopeString.validate(value).err;
    if (err) {
      return err;
    }
    try {
      return { value: ScopeSet.fromString(value || '') };
    } catch (err) {
      return {
        errors: this.$_createError('scope.base', { v: value }, state, options),
      };
    }
  },
}).scope();

export const redirectUri = Joi.string()
  .max(256)
  .regex(/^[a-zA-Z0-9\-_\/.:?=&]+$/);

// taken from mozilla/persona/lib/validate.js
export const assertion = Joi.string()
  .min(50)
  .max(10240)
  .regex(/^[a-zA-Z0-9_\-\.~=]+$/);

export const jwe = Joi.string()
  .max(1024)
  // JWE token format: 'protectedheader.encryptedkey.iv.cyphertext.authenticationtag'
  .regex(
    /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
  );

export const jwt = Joi.string()
  .max(1024)
  // JWT format: 'header.payload.signature'
  .regex(/^([a-zA-Z0-9\-_]+)\.([a-zA-Z0-9\-_]+)\.([a-zA-Z0-9\-_]+)$/);

export const accessToken = Joi.alternatives().try(token, jwt);
export const ppidSeed = authServerValidators.ppidSeed.default(0);
export const resourceUrl = authServerValidators.resourceUrl;
export const pkceCodeChallengeMethod = authServerValidators.pkceCodeChallengeMethod;
export const pkceCodeChallenge = authServerValidators.pkceCodeChallenge;
export const pkceCodeVerifier = authServerValidators.pkceCodeVerifier;
export const refreshToken = authServerValidators.refreshToken;
export const authorizationCode = authServerValidators.authorizationCode;
export const url = authServerValidators.url;
export const hexString = authServerValidators.hexString;
