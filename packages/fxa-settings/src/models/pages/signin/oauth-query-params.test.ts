/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { queryStringToGenericData } from '../../../lib/model-data';
import {
  OAuthNativeSyncQueryParameters,
  OAuthQueryParams,
} from './oauth-query-params';

/**
 * These tests spot check certain validation rules. We don't necessary want to revalidate that
 * the class-validator works, but there are certain params like keys_jwk, or redirect_uri that threw
 * a couple curve balls, and need extra options or a specific regex to be compatible with the legacy
 * content-server's vat rules.
 */

describe('OAuthQueryParams checks', function () {
  function validate(query: string) {
    return new OAuthQueryParams(queryStringToGenericData(query)).tryValidate();
  }

  it('requires parameters', () => {
    const result = validate('');
    expect(result.isValid).toBeFalsy();
  });

  it('should pass', () => {
    const result = validate('client_id=123abc&scope=profile');
    expect(result.isValid).toBeTruthy();
  });

  it('checks max age pass', () => {
    expect(
      validate('client_id=123abc&scope=profile&max_age=-1').isValid
    ).toBeFalsy();
    expect(
      validate('client_id=123abc&scope=profile&max_age=100').isValid
    ).toBeTruthy();
  });

  it('checks prompt', () => {
    expect(
      validate('client_id=123abc&scope=profile&prompt=foo').isValid
    ).toBeFalsy();
    expect(
      validate('client_id=123abc&scope=profile&prompt=login').isValid
    ).toBeTruthy();
  });

  it('checks redirect uri', () => {
    expect(
      validate(
        'client_id=123abc&scope=profile&redirect_uri=tps://localhost:3030/app?foo=bar'
      ).isValid
    ).toBeFalsy();
    expect(
      validate(
        'client_id=123abc&scope=profile&redirect_uri=https://localhost:3030/app?foo=bar'
      ).isValid
    ).toBeTruthy();
    expect(
      validate(
        'client_id=123abc&scope=profile&redirect_uri=urn:ietf:wg:oauth:2.0:oob:pair-auth-webchannel'
      ).isValid
    ).toBeTruthy();
  });

  it('checks keys_jwk', () => {
    const query =
      'client_id=123abc&scope=profile&keys_jwk=eyJrdHkiOiJFQyIsImtpZCI6Im9DNGFudFBBSFZRX1pmQ09RRUYycTRaQlZYblVNZ2xISGpVRzdtSjZHOEEiLCJjcnYiOiJQLTI1NiIsIngiOiJDeUpUSjVwbUNZb2lQQnVWOTk1UjNvNTFLZVBMaEg1Y3JaQlkwbXNxTDk0IiwieSI6IkJCWDhfcFVZeHpTaldsdXU5MFdPTVZwamIzTlpVRDAyN0xwcC04RW9vckEifQ';

    expect(validate(query).isValid).toBeTruthy();
  });

  it('supports sync signin', () => {
    const queryParams =
      'uniqueUserId=0b4cee0e-900e-45ac-bf0f-bd154146e9b8&access_type=offline&client_id=dcdb5ae7add825d2&pkce_client_id=38a6b9b3a65a1871&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Foauth&scope=profile%20openid&action=signin&state=';

    expect(validate(queryParams).isValid).toBeTruthy();
  });
});

describe('OAuthNativeSyncQueryParameters checks', function () {
  function validate(query: string) {
    return new OAuthNativeSyncQueryParameters(
      queryStringToGenericData(query)
    ).tryValidate();
  }
  it('supports sync signin', () => {
    const queryParams =
      'uniqueUserId=0b4cee0e-900e-45ac-bf0f-bd154146e9b8&access_type=offline&client_id=dcdb5ae7add825d2&pkce_client_id=38a6b9b3a65a1871&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Foauth&scope=profile%20openid&action=signin&state=jsklfl8jsf8sl';
    const result = validate(queryParams);
    expect(result.isValid).toBeTruthy();
  });
});
