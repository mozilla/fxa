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
        pageTitle
        headerLogoUrl
        headerLogoAltText
        featureFlags {
          syncConfirmedPageHideCTA
          syncHidePromoAfterLogin
        }
        backgrounds {
          defaultLayout
          header
          splitLayout
          splitLayoutAltText
        }
        favicon
        headlineFontSize
        headlineTextColor
        additionalAccessibilityInfo
      }
      EmailFirstPage {
        logoUrl
        logoAltText
        headline
        description
        primaryButtonText
        pageTitle
        splitLayout
      }
      SignupSetPasswordPage {
        logoUrl
        logoAltText
        headline
        description
        primaryButtonText
        pageTitle
        splitLayout
      }
      SignupConfirmCodePage {
        headline
        description
        primaryButtonText
        pageTitle
        splitLayout
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
        splitLayout
      }
      SignupPasswordlessCodePage {
        headline
        description
        primaryButtonText
        pageTitle
        primaryImage {
          url
          altText
        }
        splitLayout
      }
      SigninPage {
        headline
        description
        primaryButtonText
        pageTitle
        splitLayout
      }
      SigninCachedPage {
        logoUrl
        logoAltText
        headline
        description
        primaryButtonText
        pageTitle
        splitLayout
      }
      SigninPasswordlessCodePage {
        headline
        description
        primaryButtonText
        pageTitle
        primaryImage {
          url
          altText
        }
        splitLayout
      }
      SigninTokenCodePage {
        headline
        description
        primaryButtonText
        pageTitle
        splitLayout
      }
      SigninUnblockCodePage {
        headline
        description
        primaryButtonText
        pageTitle
        splitLayout
      }
      SigninTotpCodePage {
        headline
        description
        primaryButtonText
        pageTitle
        splitLayout
      }
      SigninRecoveryChoicePage {
        headline
        description
        primaryButtonText
        pageTitle
        splitLayout
      }
      SigninRecoveryCodePage {
        headline
        description
        primaryButtonText
        pageTitle
        primaryImage {
          url
          altText
        }
        splitLayout
      }
      SigninRecoveryPhonePage {
        headline
        description
        primaryButtonText
        pageTitle
        primaryImage {
          url
          altText
        }
        splitLayout
      }
      NewDeviceLoginEmail {
        subject
        headline
        description
      }
      PasswordlessSigninOtpEmail {
        subject
        headline
        description
      }
      PasswordlessSignupOtpEmail {
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
