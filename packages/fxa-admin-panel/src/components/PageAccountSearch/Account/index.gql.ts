/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { gql } from '@apollo/client';

export const RECORD_ADMIN_SECURITY_EVENT = gql`
  mutation recordAdminSecurityEvent($uid: String!, $name: String!) {
    recordAdminSecurityEvent(uid: $uid, name: $name)
  }
`;

export const EDIT_LOCALE = gql`
  mutation editLocale($uid: String!, $locale: String!) {
    editLocale(uid: $uid, locale: $locale)
  }
`;

export const UNLINK_ACCOUNT = gql`
  mutation unlinkAccount($uid: String!) {
    unlinkAccount(uid: $uid)
  }
`;
