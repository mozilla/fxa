/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';

import {
  AlertFullIcon,
  AlertOutlineCurrentIcon,
  AuthenticatorAppIcon,
  BackupCodesIcon,
  BackupCodesDisabledIcon,
  BackupRecoverySmsIcon,
  BackupRecoverySmsDisabledIcon,
  CheckmarkGreenIcon,
  CheckmarkCircleFullGreenIcon,
  CheckmarkCircleOutlineCurrentIcon,
  CloseIcon,
  CodeIcon,
  ErrorOutlineCurrentIcon,
  FlagCanadaIcon,
  FlagUsaIcon,
  InformationOutlineBlueIcon,
  InformationOutlineCurrentIcon,
  LightbulbIcon,
} from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/Icons',
  subcomponents: {
    AlertFullIcon,
    AlertOutlineCurrentIcon,
    AuthenticatorAppIcon,
    BackupCodesIcon,
    BackupCodesDisabledIcon,
    BackupRecoverySmsIcon,
    BackupRecoverySmsDisabledIcon,
    CheckmarkGreenIcon,
    CheckmarkCircleFullGreenIcon,
    CheckmarkCircleOutlineCurrentIcon,
    CloseIcon,
    CodeIcon,
    ErrorOutlineCurrentIcon,
    FlagCanadaIcon,
    FlagUsaIcon,
    InformationOutlineBlueIcon,
    InformationOutlineCurrentIcon,
    LightbulbIcon,
  },
  decorators: [withLocalization],
} as Meta;

export const Alert = () => <AlertFullIcon mode="warning" />;
export const AlertOutline = () => <AlertOutlineCurrentIcon mode="attention" />;
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
export const CheckmarkCircleOutlineCurrent = () => (
  <CheckmarkCircleOutlineCurrentIcon mode="success" />
);
export const Close = () => <CloseIcon />;
export const Code = () => <CodeIcon />;
export const ErrorOutlineCurrent = () => <ErrorOutlineCurrentIcon />;
export const FlagCanada = () => <FlagCanadaIcon />;
export const FlagUsa = () => <FlagUsaIcon />;
export const InformationCircleOutlineBlue = () => (
  <InformationOutlineBlueIcon />
);
export const InformationCircleOutlineCurrent = () => (
  <InformationOutlineCurrentIcon />
);
export const Lightbulb = () => <LightbulbIcon />;
