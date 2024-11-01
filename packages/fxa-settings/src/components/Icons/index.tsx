/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { ImageProps, PreparedImage as PreparedIcon } from '../PreparedImage';
import { ReactComponent as Alert } from './icon_alert.svg';
import { ReactComponent as AuthenticatorApp } from './icon_authenticator_app.svg';
import { ReactComponent as BackupCodes } from './icon_backup_codes.svg';
import { ReactComponent as BackupCodesDisabled } from './icon_backup_codes_disabled.svg';
import { ReactComponent as BackupRecoverySmsDisabled } from './icon_backup_recovery_sms_disabled.svg';
import { ReactComponent as BackupRecoverySms } from './icon_backup_recovery_sms.svg';
import { ReactComponent as CheckmarkGreen } from './icon_checkmark_green.svg';
import { ReactComponent as CheckmarkCircleFullGreen } from './icon_checkmark_circle_full_green.svg';
import { ReactComponent as CheckmarkCircleOutlineBlack } from './icon_checkmark_circle_outline_black.svg';
import { ReactComponent as Code } from './icon_code.svg';
import { ReactComponent as FlagCanada } from './icon_flag_canada.svg';
import { ReactComponent as FlagUsa } from './icon_flag_usa.svg';
import { ReactComponent as InformationCircleOutlineBlue } from './icon_information_circle_outline_blue.svg';
import { ReactComponent as InformationCircleOutlineBlack } from './icon_information_circle_outline_black.svg';

export const AlertIcon = ({ className, ariaHidden }: ImageProps) => (
  <PreparedIcon
    Image={Alert}
    ariaLabel="Alert"
    ariaLabelFtlId="alert-icon-aria-label"
    {...{ className, ariaHidden }}
  />
);

export const AuthenticatorAppIcon = ({ className, ariaHidden }: ImageProps) => (
  <PreparedIcon
    Image={AuthenticatorApp}
    ariaLabel="Authenticator Application"
    ariaLabelFtlId="authenticator-app-aria-label"
    {...{ className, ariaHidden }}
  />
);

export const BackupCodesIcon = ({ className, ariaHidden }: ImageProps) => (
  <PreparedIcon
    Image={BackupCodes}
    ariaLabel="Backup codes enabled"
    ariaLabelFtlId="backup-codes-icon-aria-label"
    {...{ className, ariaHidden }}
  />
);

export const BackupCodesDisabledIcon = ({
  className,
  ariaHidden,
}: ImageProps) => (
  <PreparedIcon
    Image={BackupCodesDisabled}
    ariaLabel="Backup codes disabled"
    ariaLabelFtlId="backup-codes-disabled-icon-aria-label"
    {...{ className, ariaHidden }}
  />
);

export const BackupRecoverySmsIcon = ({
  className,
  ariaHidden,
}: ImageProps) => (
  <PreparedIcon
    Image={BackupRecoverySms}
    ariaLabel="Recovery SMS enabled"
    ariaLabelFtlId="backup-recovery-sms-icon-aria-label"
    {...{ className, ariaHidden }}
  />
);

export const BackupRecoverySmsDisabledIcon = ({
  className,
  ariaHidden,
}: ImageProps) => (
  <PreparedIcon
    Image={BackupRecoverySmsDisabled}
    ariaLabel="Recovery SMS Disabled"
    ariaLabelFtlId="backup-recovery-sms-disabled-icon-aria-label"
    {...{ className, ariaHidden }}
  />
);

type CheckmarkMode = 'enabled' | 'success' | 'check';
function getCheckMarkAria(mode: CheckmarkMode) {
  switch (mode) {
    case 'enabled':
      return {
        ariaLabel: 'Enabled',
        ariaLabelFtlId: 'checkmark-enabled-icon-aria-label',
      };
    case 'success':
      return {
        ariaLabel: 'Success',
        ariaLabelFtlId: 'checkmark-success-icon-aria-label',
      };
    case 'check':
    default:
      return {
        ariaLabel: 'Check',
        ariaLabelFtlId: 'checkmark-icon-aria-label',
      };
  }
}

export type CheckmarkProps = ImageProps & { mode: CheckmarkMode };
export const CheckmarkGreenIcon = ({
  className,
  ariaHidden,
  mode,
}: CheckmarkProps) => (
  <PreparedIcon
    Image={CheckmarkGreen}
    {...{
      className,
      ariaHidden,
      ...getCheckMarkAria(mode),
    }}
  />
);

export const CheckmarkCircleFullGreenIcon = ({
  className,
  ariaHidden,
  mode,
}: CheckmarkProps) => (
  <PreparedIcon
    Image={CheckmarkCircleFullGreen}
    {...{
      className,
      ariaHidden,
      ...getCheckMarkAria(mode),
    }}
  />
);
export const CheckmarkCircleOutlineBlackIcon = ({
  className,
  ariaHidden,
  mode,
}: CheckmarkProps) => (
  <PreparedIcon
    Image={CheckmarkCircleOutlineBlack}
    {...{
      className,
      ariaHidden,
      ...getCheckMarkAria(mode),
    }}
  />
);

export const CodeIcon = ({ className, ariaHidden }: ImageProps) => (
  <PreparedIcon
    Image={Code}
    ariaLabel="Code"
    ariaLabelFtlId="code-icon-aria-label"
    {...{ className, ariaHidden }}
  />
);

export const FlagCanadaIcon = ({ className, ariaHidden }: ImageProps) => (
  <PreparedIcon
    ariaLabel="Canadian Flag"
    ariaLabelFtlId="canadian-flag-icon-aria-label"
    Image={FlagCanada}
    {...{ className, ariaHidden }}
  />
);

export const FlagUsaIcon = ({ className, ariaHidden }: ImageProps) => (
  <PreparedIcon
    ariaLabel="United States Flag"
    ariaLabelFtlId="usa-flag-icon-aria-label"
    Image={FlagUsa}
    {...{ className, ariaHidden }}
  />
);

export const InformationCircleOutlineBlueIcon = ({
  className,
  ariaHidden,
}: ImageProps) => (
  <PreparedIcon
    Image={InformationCircleOutlineBlue}
    ariaLabel="Information"
    ariaLabelFtlId="info-icon-aria-label"
    {...{ className, ariaHidden }}
  />
);

export const InformationCircleOutlineBlackIcon = ({
  className,
  ariaHidden,
}: ImageProps) => (
  <PreparedIcon
    Image={InformationCircleOutlineBlack}
    ariaLabel="Information"
    ariaLabelFtlId="info-icon-aria-label"
    {...{ className, ariaHidden }}
  />
);
