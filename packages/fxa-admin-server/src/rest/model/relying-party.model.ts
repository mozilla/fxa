/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class RelyingPartyUpdateDto {
  name!: string;

  imageUri!: string;

  redirectUri!: string;

  canGrant!: boolean;

  publicClient!: boolean;

  trusted!: boolean;

  allowedScopes!: string;

  notes!: string;
}

export class RelyingPartyDto {
  id!: string;

  createdAt!: number;

  name!: string;

  imageUri!: string;

  redirectUri!: string;

  canGrant!: boolean;

  publicClient!: boolean;

  trusted!: boolean;

  allowedScopes!: string;

  notes!: string;

  hasSecret!: boolean;

  hasPreviousSecret!: boolean;
}

export class RelyingPartyCreatedDto {
  id!: string;

  secret!: string;
}

export class RotateSecretDto {
  secret!: string;
}
