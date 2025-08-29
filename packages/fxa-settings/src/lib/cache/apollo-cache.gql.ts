/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { gql } from '@apollo/client';

/**
 * This query reads from the local apollo-client cache and does not perform
 * a network request and therefore is low-cost. It updates if any GQL network
 * request response comes back with an 'invalid token' + 'unauthenticated' status
 * (to `false`), and if a network request that requires auth succeeds. Because
 * we have an initial metrics query that runs at the top of our app that requires
 * a valid session token, this value will be updated on initial app start.
 *
 * If you create a new GQL query that should update this status to 'true', e.g.
 * a query requiring a session token or a query that logs the user in, update
 * the list in `lib/gql.ts` to include it.
 *
 * NOTE: This status can mean that the user has a valid session token, but
 * does NOT currently tell you if that session is verified or unverified. We
 * may be able to tell this in the GQL response as errno 138 from auth-server
 * means "Unverified session", but we don't appear to currently need a verified
 * session for GQL calls in non-Settings routes. In Settings, we're currently
 * using auth-client for those calls.
 *
 * If you need to confirm that the session is _verified_, use
 * `GET_SESSION_VERIFIED`.
 * */
export const GET_LOCAL_SIGNED_IN_STATUS = gql`
  query GetLocalSignedInStatus {
    isSignedIn @client
  }
`;

export const GET_ACCOUNT = gql`
  query GetAccount {
    account {
      uid
      displayName
      avatar {
        id
        url
        isDefault @client
      }
      accountCreated
      passwordCreated
      recoveryKey {
        exists
        estimatedSyncDeviceCount
      }
      metricsEnabled
      primaryEmail @client
      emails {
        email
        isPrimary
        verified
      }
      attachedClients {
        clientId
        isCurrentSession
        userAgent
        deviceType
        deviceId
        name
        lastAccessTime
        lastAccessTimeFormatted
        approximateLastAccessTime
        approximateLastAccessTimeFormatted
        location {
          city
          country
          state
          stateCode
        }
        os
        sessionTokenId
        refreshTokenId
      }
      totp {
        exists
        verified
      }
      backupCodes {
        hasBackupCodes
        count
      }
      recoveryPhone {
        exists
        phoneNumber
        nationalFormat
        available
      }
      subscriptions {
        created
        productName
      }
      linkedAccounts {
        providerId
        authAt
        enabled
      }
    }
  }
`;

export const GET_ACCOUNT_UID = gql`
  query GetUid {
    account {
      uid
    }
  }
`;

export const UPDATE_PASSWORD = gql`
  query UpdatePassword {
    account {
      passwordCreated
    }
    session {
      verified
    }
  }
`;

export const GET_VERIFIED_SESSION = gql`
  query GetSession {
    session {
      verified
    }
  }
`;
