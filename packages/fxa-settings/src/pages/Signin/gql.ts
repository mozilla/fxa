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
