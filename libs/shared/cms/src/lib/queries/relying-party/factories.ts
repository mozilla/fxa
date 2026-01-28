/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import {
  RelyingPartiesQuery,
  Enum_Componentaccountsshared_Headlinefontsize,
} from '../../../__generated__/graphql';
import { RelyingPartyResult } from '@fxa/shared/cms';

export const RelyingPartyQueryFactory = (
  override?: Partial<RelyingPartiesQuery>
): RelyingPartiesQuery => ({
  relyingParties: [RelyingPartyResultFactory()],
  ...override,
});

export const RelyingPartyResultFactory = (
  override?: Partial<RelyingPartyResult>
) => ({
  clientId: faker.string.hexadecimal(),
  entrypoint: faker.string.hexadecimal(),
  name: faker.string.sample(),
  l10nId: faker.string.sample(),
  EmailFirstPage: {
    logoUrl: faker.internet.url(),
    logoAltText: faker.internet.url(),
    headline: faker.string.sample(),
    description: faker.string.sample(),
    primaryButtonText: faker.string.sample(),
    pageTitle: faker.string.sample(),
    splitLayout: faker.datatype.boolean(),
  },
  SignupSetPasswordPage: {
    logoUrl: faker.internet.url(),
    logoAltText: faker.internet.url(),
    headline: faker.string.sample(),
    description: faker.string.sample(),
    primaryButtonText: faker.string.sample(),
    pageTitle: faker.string.sample(),
    splitLayout: faker.datatype.boolean(),
  },
  SignupConfirmCodePage: {
    logoUrl: faker.internet.url(),
    logoAltText: faker.internet.url(),
    headline: faker.string.sample(),
    description: faker.string.sample(),
    primaryButtonText: faker.string.sample(),
    pageTitle: faker.string.sample(),
    splitLayout: faker.datatype.boolean(),
  },
  SignupConfirmedSyncPage: {
    logoUrl: faker.internet.url(),
    logoAltText: faker.internet.url(),
    headline: faker.string.sample(),
    description: faker.string.sample(),
    primaryButtonText: faker.string.sample(),
    pageTitle: faker.string.sample(),
    primaryImage: {
      url: faker.internet.url(),
      altText: faker.string.sample(),
    },
    splitLayout: faker.datatype.boolean(),
  },
  shared: {
    buttonColor: faker.color.rgb(),
    logoUrl: faker.internet.url(),
    logoAltText: faker.string.sample(),
    emailFromName: faker.string.sample(),
    emailLogoUrl: faker.internet.url(),
    emailLogoAltText: faker.string.sample(),
    emailLogoWidth: `${faker.number.int({ min: 10, max: 1000 })}px`,
    backgrounds: {
      defaultLayout: faker.color.rgb(),
      splitLayout: faker.color.rgb(),
      header: faker.color.rgb(),
      splitLayoutAltText: faker.string.sample(),
    },
    pageTitle: faker.string.sample(),
    headerLogoUrl: faker.internet.url(),
    headerLogoAltText: faker.string.sample(),
    featureFlags: {
      syncConfirmedPageHideCTA: faker.datatype.boolean(),
      syncHidePromoAfterLogin: faker.datatype.boolean(),
    },
    favicon: faker.internet.url(),
    headlineFontSize: faker.helpers.arrayElement([
      Enum_Componentaccountsshared_Headlinefontsize.Default,
      Enum_Componentaccountsshared_Headlinefontsize.Medium,
      Enum_Componentaccountsshared_Headlinefontsize.Large,
    ]),
    headlineTextColor: faker.color.rgb(),
    additionalAccessibilityInfo: faker.string.sample(),
  },
  NewDeviceLoginEmail: {
    logoUrl: faker.internet.url(),
    logoAltText: faker.internet.url(),
    subject: faker.string.sample(),
    headline: faker.string.sample(),
    description: faker.string.sample(),
    splitLayout: faker.datatype.boolean(),
  },
  VerifyLoginCodeEmail: {
    logoUrl: faker.internet.url(),
    logoAltText: faker.internet.url(),
    subject: faker.string.sample(),
    headline: faker.string.sample(),
    description: faker.string.sample(),
    splitLayout: faker.datatype.boolean(),
  },
  VerifyShortCodeEmail: {
    logoUrl: faker.internet.url(),
    logoAltText: faker.internet.url(),
    subject: faker.string.sample(),
    headline: faker.string.sample(),
    description: faker.string.sample(),
    splitLayout: faker.datatype.boolean(),
  },
  SigninPage: {
    logoUrl: faker.internet.url(),
    logoAltText: faker.internet.url(),
    headline: faker.string.sample(),
    description: faker.string.sample(),
    primaryButtonText: faker.string.sample(),
    pageTitle: faker.string.sample(),
    splitLayout: faker.datatype.boolean(),
  },
  SigninTokenCodePage: {
    logoUrl: faker.internet.url(),
    logoAltText: faker.internet.url(),
    headline: faker.string.sample(),
    description: faker.string.sample(),
    primaryButtonText: faker.string.sample(),
    pageTitle: faker.string.sample(),
    splitLayout: faker.datatype.boolean(),
  },
  SigninUnblockCodePage: {
    logoUrl: faker.internet.url(),
    logoAltText: faker.internet.url(),
    headline: faker.string.sample(),
    description: faker.string.sample(),
    primaryButtonText: faker.string.sample(),
    pageTitle: faker.string.sample(),
    splitLayout: faker.datatype.boolean(),
  },
  ...override,
});
