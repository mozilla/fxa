/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { gql } from '@apollo/client';

export const AVATAR_QUERY = gql`
  query AvatarQuery {
    account {
      avatar {
        id
        url
      }
    }
  }
`;

export const BEGIN_SIGNIN_MUTATION = gql`
  mutation SignIn($input: SignInInput!) {
    signIn(input: $input) {
      uid
      sessionToken
      authAt
      metricsEnabled
      verified
      keyFetchToken
      verificationMethod
      verificationReason
    }
  }
`;

export const PASSWORD_CHANGE_START_MUTATION = gql`
  mutation passwordChangeStart($input: PasswordChangeStartInput!) {
    passwordChangeStart(input: $input) {
      keyFetchToken
      passwordChangeToken
    }
  }
`;

export const PASSWORD_CHANGE_FINISH_MUTATION = gql`
  mutation PasswordChangeFinish($input: PasswordChangeFinishInput!) {
    passwordChangeFinish(input: $input) {
      uid
      sessionToken
      verified
      authAt
      keyFetchToken
      keyFetchToken2
    }
  }
`;

export const GET_ACCOUNT_KEYS_MUTATION = gql`
  mutation WrappedAccountKeys($input: String!) {
    wrappedAccountKeys(input: $input) {
      kA
      wrapKB
    }
  }
`;

export const CREDENTIAL_STATUS_MUTATION = gql`
  mutation CredentialStatus($input: String!) {
    credentialStatus(input: $input) {
      upgradeNeeded
      currentVersion
      clientSalt
    }
  }
`;
