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
      l10nId
      shared {
        buttonColor
        logoUrl
        logoAltText
        emailFromName
        emailLogoUrl
        emailLogoAltText
        emailLogoWidth
        backgroundColor
        headerBackground
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
        pageTitle
      }
      SignupSetPasswordPage {
        logoUrl
        logoAltText
        headline
        description
        primaryButtonText
        pageTitle
      }
      SignupConfirmCodePage {
        headline
        description
        primaryButtonText
        pageTitle
      }
      SignupConfirmedSyncPage {
        headline
        description
        primaryButtonText
        pageTitle
        primaryImage {
          url
          altText
        }
      }
      SigninPage {
        headline
        description
        primaryButtonText
        pageTitle
      }
      SigninTokenCodePage {
        headline
        description
        primaryButtonText
        pageTitle
      }
      SigninUnblockCodePage {
        headline
        description
        primaryButtonText
        pageTitle
      }
      shared {
        buttonColor
        logoUrl
        logoAltText
        emailFromName
        emailLogoUrl
        emailLogoAltText
        emailLogoWidth
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
