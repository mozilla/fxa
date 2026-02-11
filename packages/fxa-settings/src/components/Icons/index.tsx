/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { ImageProps, PreparedImage as PreparedIcon } from '../PreparedImage';
import { ReactComponent as AlertFull } from './icon_alert_triangle_full_yellow.min.svg';
import { ReactComponent as AlertOutlineCurrent } from './icon_alert_triangle_outline_current.min.svg';
import { ReactComponent as AuthenticatorApp } from './icon_authenticator_app.min.svg';
import { ReactComponent as BackupCodes } from './icon_backup_codes.min.svg';
import { ReactComponent as BackupCodesDisabled } from './icon_backup_codes_disabled.min.svg';
import { ReactComponent as BackupRecoverySmsDisabled } from './icon_backup_recovery_sms_disabled.min.svg';
import { ReactComponent as BackupRecoverySms } from './icon_backup_recovery_sms.min.svg';
import { ReactComponent as CheckmarkGreen } from './icon_checkmark_green.min.svg';
import { ReactComponent as CheckmarkCircleFullGreen } from './icon_checkmark_circle_full_green.min.svg';
import { ReactComponent as CheckmarkCircleOutlineCurrent } from './icon_checkmark_circle_outline_current.min.svg';
import { ReactComponent as Close } from './icon_close.min.svg';
import { ReactComponent as Code } from './icon_code.min.svg';
import { ReactComponent as ErrorOutlineCurrent } from './icon_error_circle_outline_current.min.svg';
import { ReactComponent as FlagCanada } from './icon_flag_canada.min.svg';
import { ReactComponent as FlagUsa } from './icon_flag_usa.min.svg';
import { ReactComponent as InformationOutlineCurrent } from './icon_information_circle_outline_current.min.svg';
import { ReactComponent as InformationOutlineBlue } from './icon_information_circle_outline_blue.min.svg';
import { ReactComponent as Lightbulb } from './icon_lightbulb.min.svg';

type AlertMode = 'alert' | 'attention' | 'warning';
function getAlertAria(mode: AlertMode) {
  switch (mode) {
    case 'alert':
      return {
        ariaLabel: 'Alert',
        ariaLabelFtlId: 'alert-icon-aria-label',
      };
    case 'attention':
      return {
        ariaLabel: 'Attention',
        ariaLabelFtlId: 'icon-attention-aria-label',
      };
    case 'warning':
    default:
      return {
        ariaLabel: 'Warning',
        ariaLabelFtlId: 'icon-warning-aria-label',
      };
  }
}

export type AlertProps = ImageProps & { mode: AlertMode };
export const AlertFullIcon = ({ className, ariaHidden, mode }: AlertProps) => (
  <PreparedIcon
    Image={AlertFull}
    ariaLabel="Alert"
    ariaLabelFtlId="alert-icon-aria-label"
    {...{ className, ariaHidden }}
  />
);

/**
 * To modify the icon color, pass in a tailwind classname with the desired color (text-blue-50, text-red-50, etc.)
 * This SVG icon uses currentColor for better support in High Contrast Mode
 */
export const AlertOutlineCurrentIcon = ({
  className,
  ariaHidden,
  mode,
}: AlertProps) => (
  <PreparedIcon
    Image={AlertOutlineCurrent}
    {...{ className, ariaHidden, ...getAlertAria(mode) }}
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
    ariaLabel="Backup authentication codes enabled"
    ariaLabelFtlId="backup-codes-icon-aria-label-v2"
    {...{ className, ariaHidden }}
  />
);

export const BackupCodesDisabledIcon = ({
  className,
  ariaHidden,
}: ImageProps) => (
  <PreparedIcon
    Image={BackupCodesDisabled}
    ariaLabel="Backup authentication codes disabled"
    ariaLabelFtlId="backup-codes-disabled-icon-aria-label-v2"
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

/**
 * To modify the icon color, pass in a tailwind classname with the desired color (text-blue-50, text-red-50, etc.)
 * This SVG icon uses currentColor for better support in High Contrast Mode
 * Checkmark icons should NOT be reversed for RTL languages. Ref: https://spectrum.adobe.com/page/bi-directionality/#Dont-mirror-checkmarks
 */
export const CheckmarkCircleOutlineCurrentIcon = ({
  className,
  ariaHidden,
  mode,
}: CheckmarkProps) => (
  <PreparedIcon
    Image={CheckmarkCircleOutlineCurrent}
    {...{
      className,
      ariaHidden,
      ...getCheckMarkAria(mode),
    }}
  />
);

/**
 * To modify the icon color, pass in a tailwind classname with the desired color (text-blue-50, text-red-50, etc.)
 * This SVG icon uses currentColor for better support in High Contrast Mode
 */
export const CloseIcon = ({ className, ariaHidden }: ImageProps) => (
  <PreparedIcon
    ariaLabel="Close message"
    ariaLabelFtlId="close-icon-aria-label"
    Image={Close}
    {...{ className, ariaHidden }}
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

/**
 * To modify the icon color, pass in a tailwind classname with the desired color (text-blue-50, text-red-50, etc.)
 * This SVG icon uses currentColor for better support in High Contrast Mode
 */
export const ErrorOutlineCurrentIcon = ({
  className,
  ariaHidden,
}: ImageProps) => (
  <PreparedIcon
    Image={ErrorOutlineCurrent}
    ariaLabel="Error"
    ariaLabelFtlId="error-icon-aria-label"
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

export const InformationOutlineBlueIcon = ({
  className,
  ariaHidden,
}: ImageProps) => (
  <PreparedIcon
    Image={InformationOutlineBlue}
    ariaLabel="Information"
    ariaLabelFtlId="info-icon-aria-label"
    {...{ className, ariaHidden }}
  />
);

/**
 * To modify the icon color, pass in a tailwind classname with the desired color (text-blue-50, text-red-50, etc.)
 * This SVG icon uses currentColor for better support in High Contrast Mode
 */
export const InformationOutlineCurrentIcon = ({
  className,
  ariaHidden,
}: ImageProps) => (
  <PreparedIcon
    Image={InformationOutlineCurrent}
    ariaLabel="Information"
    ariaLabelFtlId="info-icon-aria-label"
    {...{ className, ariaHidden }}
  />
);

export const LightbulbIcon = ({ className, ariaHidden }: ImageProps) => (
  <PreparedIcon
    Image={Lightbulb}
    ariaLabel="Lightbulb"
    ariaLabelFtlId="lightbulb-icon-aria-label"
    {...{ className, ariaHidden }}
  />
);
