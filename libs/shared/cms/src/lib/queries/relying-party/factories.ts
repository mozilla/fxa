/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';

import { RelyingPartiesQuery } from '../../../__generated__/graphql';
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
  EmailFirstPage: {
    logoUrl: faker.internet.url(),
    logoAltText: faker.internet.url(),
    headline: faker.string.sample(),
    description: faker.string.sample(),
    primaryButtonText: faker.string.sample(),
  },
  SignupSetPasswordPage: {
    logoUrl: faker.internet.url(),
    logoAltText: faker.internet.url(),
    headline: faker.string.sample(),
    description: faker.string.sample(),
    primaryButtonText: faker.string.sample(),
  },
  SignupConfirmCodePage: {
    logoUrl: faker.internet.url(),
    logoAltText: faker.internet.url(),
    headline: faker.string.sample(),
    description: faker.string.sample(),
    primaryButtonText: faker.string.sample(),
  },
  SignupConfirmedSyncPage: {
    logoUrl: faker.internet.url(),
    logoAltText: faker.internet.url(),
    headline: faker.string.sample(),
    description: faker.string.sample(),
    primaryButtonText: faker.string.sample(),
  },
  shared: {
    buttonColor: faker.color.rgb(),
    logoUrl: faker.internet.url(),
    logoAltText: faker.string.sample(),
    emailFromName: faker.string.sample(),
    emailLogoUrl: faker.internet.url(),
    emailLogoAltText: faker.string.sample(),
    backgroundColor: faker.color.rgb(),
    pageTitle: faker.string.sample(),
    headerLogoUrl: faker.internet.url(),
    headerLogoAltText: faker.string.sample(),
    featureFlags: {
      syncConfirmedPageHideCTA: faker.datatype.boolean(),
      syncHidePromoAfterLogin: faker.datatype.boolean(),
    },
  },
  NewDeviceLoginEmail: {
    logoUrl: faker.internet.url(),
    logoAltText: faker.internet.url(),
    subject: faker.string.sample(),
    headline: faker.string.sample(),
    description: faker.string.sample(),
  },
  VerifyLoginCodeEmail: {
    logoUrl: faker.internet.url(),
    logoAltText: faker.internet.url(),
    subject: faker.string.sample(),
    headline: faker.string.sample(),
    description: faker.string.sample(),
  },
  VerifyShortCodeEmail: {
    logoUrl: faker.internet.url(),
    logoAltText: faker.internet.url(),
    subject: faker.string.sample(),
    headline: faker.string.sample(),
    description: faker.string.sample(),
  },
  SigninPage: {
    logoUrl: faker.internet.url(),
    logoAltText: faker.internet.url(),
    headline: faker.string.sample(),
    description: faker.string.sample(),
    primaryButtonText: faker.string.sample(),
  },
  SigninTokenCodePage: {
    logoUrl: faker.internet.url(),
    logoAltText: faker.internet.url(),
    headline: faker.string.sample(),
    description: faker.string.sample(),
    primaryButtonText: faker.string.sample(),
  },
  SigninUnblockCodePage: {
    logoUrl: faker.internet.url(),
    logoAltText: faker.internet.url(),
    headline: faker.string.sample(),
    description: faker.string.sample(),
    primaryButtonText: faker.string.sample(),
  },
  ...override,
});
