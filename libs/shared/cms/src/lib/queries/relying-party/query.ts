/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const relyingPartyQuery = graphql(`
  query RelyingParties($clientId: String!, $entrypoint: String!) {
    relyingParties(
      filters: { clientId: { eq: $clientId }, entrypoint: { eq: $entrypoint } }
    ) {
      clientId
      entrypoint
      name
      shared {
        buttonColor
        logoUrl
        logoAltText
        emailFromName
        emailLogoUrl
        emailLogoAltText
        backgroundColor
        pageTitle
        headerLogoUrl
        headerLogoAltText
        featureFlags {
          syncConfirmedPageHideCTA
          syncHidePromoAfterLogin
        }
        favicon
      }
      EmailFirstPage {
        logoUrl
        logoAltText
        headline
        description
        primaryButtonText
      }
      SignupSetPasswordPage {
        logoUrl
        logoAltText
        headline
        description
        primaryButtonText
      }
      SignupConfirmCodePage {
        headline
        description
        primaryButtonText
      }
      SignupConfirmedSyncPage {
        headline
        description
        primaryButtonText
      }
      SigninPage {
        headline
        description
        primaryButtonText
      }
      SigninTokenCodePage {
        headline
        description
        primaryButtonText
      }
      SigninUnblockCodePage {
        headline
        description
        primaryButtonText
      }
      shared {
        buttonColor
        logoUrl
        logoAltText
        emailFromName
        emailLogoUrl
        emailLogoAltText
      }
      NewDeviceLoginEmail {
        subject
        headline
        description
      }
      VerifyLoginCodeEmail {
        subject
        headline
        description
      }
      VerifyShortCodeEmail {
        subject
        headline
        description
      }
    }
  }
`);
