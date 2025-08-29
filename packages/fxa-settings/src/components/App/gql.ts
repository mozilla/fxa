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

export const GET_RECOVERY_PHONE = gql`
  query GetRecoveryPhone {
    account {
      recoveryPhone {
        available
        exists
        phoneNumber
        nationalFormat
      }
    }
  }
`;
