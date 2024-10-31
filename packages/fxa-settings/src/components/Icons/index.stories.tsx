/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';

import {
  AlertIcon,
  AuthenticatorAppIcon,
  BackupCodesIcon,
  BackupCodesDisabledIcon,
  BackupRecoverySmsIcon,
  BackupRecoverySmsDisabledIcon,
  CheckmarkGreenIcon,
  CheckmarkCircleFullGreenIcon,
  CheckmarkCircleOutlineBlackIcon,
  CodeIcon,
  FlagCanadaIcon,
  FlagUsaIcon,
  InformationCircleOutlineBlueIcon,
  InformationCircleOutlineBlackIcon,
} from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/Icons',
  subcomponents: {
    AlertIcon,
    AuthenticatorAppIcon,
    BackupCodesIcon,
    BackupCodesDisabledIcon,
    BackupRecoverySmsIcon,
    BackupRecoverySmsDisabledIcon,
    CheckmarkIcon: CheckmarkGreenIcon,
    CheckmarkCircleFullIcon: CheckmarkCircleFullGreenIcon,
    CheckmarkCircleOutlineIcon: CheckmarkCircleOutlineBlackIcon,
    CodeIcon,
    FlagCanadaIcon,
    FlagUsaIcon,
    InformationCircleOutlineBlueIcon,
    InformationCircleOutlineBlackIcon,
  },
  decorators: [withLocalization],
} as Meta;

export const Alert = () => <AlertIcon />;
export const AuthenticatorApp = () => <AuthenticatorAppIcon />;
export const BackupCodes = () => <BackupCodesIcon />;
export const BackupCodesDisabled = () => <BackupCodesDisabledIcon />;
export const BackupRecoverySms = () => <BackupRecoverySmsIcon />;
export const BackupRecoverySmsDisabled = () => (
  <BackupRecoverySmsDisabledIcon />
);
export const Checkmark = () => <CheckmarkGreenIcon mode="check" />;
export const CheckmarkCircleFull = () => (
  <CheckmarkCircleFullGreenIcon mode="enabled" />
);
export const CheckmarkCircleOutline = () => (
  <CheckmarkCircleOutlineBlackIcon mode="success" />
);
export const Code = () => <CodeIcon />;
export const FlagCanada = () => <FlagCanadaIcon />;
export const FlagUsa = () => <FlagUsaIcon />;
export const InformationCircleOutlineBlue = () => (
  <InformationCircleOutlineBlueIcon />
);
export const InformationCircleBlack = () => (
  <InformationCircleOutlineBlackIcon />
);
