/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { gql } from '@apollo/client';

// Glean init needs 'metricsEnabled' and 'uid'.
// "Amplitude" init needs 'metricsEnabled', 'uid', 'recoveryKey',
// if secondary email is verified, and `totp.verified`.
export const INITIAL_METRICS_QUERY = gql`
  query GetInitialMetricsState {
    account {
      uid
      recoveryKey {
        exists
        estimatedSyncDeviceCount
      }
      metricsEnabled
      emails {
        email
        isPrimary
        verified
      }
      totp {
        exists
        verified
      }
    }
  }
`;

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

/**
 * This query fetches the current relying parties client information.
 */
export const GET_CLIENT_INFO = gql`
  query GetClientInfo($input: String!) {
    clientInfo(input: $input) {
      clientId
      imageUri
      redirectUri
      serviceName
      trusted
    }
  }
`;

/**
 * This query fetches the current subscription product information.
 */
export const GET_PRODUCT_INFO = gql`
  query GetProductInfo($input: String!) {
    productInfo(input: $input) {
      subscriptionProductId
      subscriptionProductName
    }
  }
`;

/**
 * This query fetches the current account TOTP (2FA Auth) status.
 */
export const GET_TOTP_STATUS = gql`
  query GetTotpStatus {
    account {
      totp {
        exists
        verified
      }
    }
  }
`;

export const GET_BACKUP_CODES_STATUS = gql`
  query GetBackupCodesStatus {
    account {
      backupCodes {
        hasBackupCodes
        count
      }
    }
  }
`;

export const GET_RECOVERY_PHONE_STATUS = gql`
  query GetRecoveryPhoneStatus {
    account {
      recoveryPhone {
        exists
        phoneNumber
        available
      }
    }
  }
`;
