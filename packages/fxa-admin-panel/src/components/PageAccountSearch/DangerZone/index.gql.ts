/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { gql } from '@apollo/client';

export const UNVERIFY_EMAIL = gql`
  mutation unverify($email: String!) {
    unverifyEmail(email: $email)
  }
`;

export const DISABLE_ACCOUNT = gql`
  mutation disableAccount($uid: String!) {
    disableAccount(uid: $uid)
  }
`;

export const ENABLE_ACCOUNT = gql`
  mutation enableAccount($uid: String!) {
    enableAccount(uid: $uid)
  }
`;

export const SEND_PASSWORD_RESET_EMAIL = gql`
  mutation sendPasswordResetEmail($email: String!) {
    sendPasswordResetEmail(email: $email)
  }
`;

export const UNSUBSCRIBE_FROM_MAILING_LISTS = gql`
  mutation unsubscribeFromMailingLists($uid: String!) {
    unsubscribeFromMailingLists(uid: $uid)
  }
`;
