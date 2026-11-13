/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import {
  IllustrationsTheme,
  ImageProps,
  PreparedImage,
} from '../PreparedImage';
import { ReactComponent as HeartsBrokenLegacy } from './graphic_hearts_broken.svg';
import { ReactComponent as HeartsVerifiedLegacy } from './graphic_hearts_verified.svg';
import { ReactComponent as BackupCodesLegacy } from './graphic_backup_codes.min.svg';
import { ReactComponent as TwoFactorAuthLegacy } from './graphic_two_factor_auth.svg';
import { ReactComponent as KeyLegacy } from './graphic_recovery_key.min.svg';
import { ReactComponent as PasswordLegacy } from './graphic_password.min.svg';
import { ReactComponent as LightbulbLegacy } from './graphic_recovery_key_hint.min.svg';
import { ReactComponent as EmailCodeLegacy } from './graphic_email_code.min.svg';
import { ReactComponent as PasswordSuccessLegacy } from './graphic_password_success.min.svg';
import { ReactComponent as BackupRecoveryPhoneLegacy } from './graphic_backup_recovery_phone.min.svg';
import { ReactComponent as BackupRecoveryPhoneCodeLegacy } from './graphic_phone_code.min.svg';
import { ReactComponent as BackupRecoveryPhoneSmsLegacy } from './graphic_phone_sms.min.svg';
import { ReactComponent as BackupAuthenticationCodesLegacy } from './graphic_authentication_codes.min.svg';
import { ReactComponent as SyncCloudsLegacy } from './graphic_sync_clouds.min.svg';
import { ReactComponent as FallingConfetti } from './graphic_celebrate_confetti.svg';
import { ReactComponent as VpnWelcome } from './graphic_vpn_welcome.svg';
import { ReactComponent as SyncDevices } from './graphic_sync_devices.min.svg';
import { ReactComponent as FirefoxWordmark } from './graphic_firefox_wordmark.min.svg';
import { ReactComponent as SyncSuccess } from './graphic_sync_success.min.svg';
import { ReactComponent as PairingInterrupted } from './graphic_pairing_interrupted.min.svg';
import { ReactComponent as LaptopQrCode } from './graphic_laptop_qr_code.min.svg';
import { ReactComponent as MobileDevicePairing } from './graphic_mobile_device_pairing.min.svg';
import { ReactComponent as QrPhoneFrame } from './graphic_qr_phone_frame.min.svg';
import { ReactComponent as PairMenuIos } from './graphic_pair_menu_ios.min.svg';
import { ReactComponent as PairMenuAndroid } from './graphic_pair_menu_android.min.svg';
import { ReactComponent as AddDevices } from './nova/add-devices.min.svg';
import { ReactComponent as AddDevicesPlatforms } from './nova/add-devices-platforms.min.svg';
import { ReactComponent as AuthenticationPhone } from './nova/authentication-phone.min.svg';
import { ReactComponent as BackupCodesNova } from './nova/backup-codes.min.svg';
import { ReactComponent as CodeSuccess } from './nova/code-success.min.svg';
import { ReactComponent as Device } from './nova/device.min.svg';
import { ReactComponent as EmailCodeNova } from './nova/email-code.min.svg';
import { ReactComponent as Insight } from './nova/insight.min.svg';
import { ReactComponent as PairingBroken } from './nova/pairing-broken.min.svg';
import { ReactComponent as RecoveryKeyCheck } from './nova/recovery-key-check.min.svg';
import { ReactComponent as RecoveryKeyHeart } from './nova/recovery-key-heart.min.svg';
import { ReactComponent as SyncArrows } from './nova/sync-arrows.min.svg';
import { ReactComponent as RecoveryCodes } from '../Icons/nova/recovery-codes.min.svg';
import { ReactComponent as RecoveryPhone } from '../Icons/nova/recovery-phone.min.svg';
import { sized, withNova } from '../../lib/nova';

// Nova illustrations (plain hex fills; CMS illustration colors don't apply).
const HeartsBroken = withNova(HeartsBrokenLegacy, PairingBroken);
const HeartsVerified = withNova(HeartsVerifiedLegacy, AddDevices);
const HeartsVerifiedPlatforms = withNova(
  HeartsVerifiedLegacy,
  AddDevicesPlatforms
);
const BackupCodes = withNova(BackupCodesLegacy, BackupCodesNova);
const TwoFactorAuth = withNova(TwoFactorAuthLegacy, Device);
const Key = withNova(KeyLegacy, RecoveryKeyHeart);
const KeyConfirm = withNova(KeyLegacy, RecoveryKeyCheck);
const Password = withNova(PasswordLegacy, AuthenticationPhone);
const Lightbulb = withNova(LightbulbLegacy, Insight);
const EmailCode = withNova(EmailCodeLegacy, EmailCodeNova);
const PasswordSuccess = withNova(PasswordSuccessLegacy, CodeSuccess);
const BackupRecoveryPhone = withNova(
  BackupRecoveryPhoneLegacy,
  AuthenticationPhone
);
const BackupRecoveryPhoneCode = withNova(BackupRecoveryPhoneCodeLegacy, Device);
const SyncClouds = withNova(SyncCloudsLegacy, SyncArrows);
const BackupRecoveryPhoneSms = withNova(
  BackupRecoveryPhoneSmsLegacy,
  sized(RecoveryPhone, 'nova:h-10 nova:w-12', null)
);
const BackupAuthenticationCodes = withNova(
  BackupAuthenticationCodesLegacy,
  sized(RecoveryCodes, 'nova:h-10 nova:w-12', null)
);

function illustrationStyle(
  colors?: IllustrationsTheme
): React.CSSProperties | undefined {
  if (!colors) return undefined;
  const style: Record<string, string> = {};
  if (colors.primary) style['--illustration-primary'] = colors.primary;
  if (colors.primaryAlt)
    style['--illustration-primary-alt'] = colors.primaryAlt;
  if (colors.secondary) style['--illustration-secondary'] = colors.secondary;
  if (colors.accentBg) style['--illustration-accent-bg'] = colors.accentBg;
  if (colors.accentFg) style['--illustration-accent-fg'] = colors.accentFg;
  if (colors.cloudPrimary)
    style['--illustration-cloud-color'] = colors.cloudPrimary;
  if (colors.cloudShadow)
    style['--illustration-clouds-bg'] = colors.cloudShadow;
  if (colors.hideClouds) style['--illustration-cloud-display'] = 'none';
  return style as React.CSSProperties;
}

export const HeartsBrokenImage = ({ className, ariaHidden }: ImageProps) => (
  <PreparedImage
    ariaLabel="A computer and a mobile phone an image of a broken heart on each"
    ariaLabelFtlId="hearts-broken-image-aria-label"
    Image={HeartsBroken}
    {...{ className, ariaHidden }}
  />
);

export const HeartsVerifiedImage = ({ className, ariaHidden }: ImageProps) => (
  <PreparedImage
    ariaLabel="A computer and a mobile phone and a tablet with a pulsing heart on each"
    ariaLabelFtlId="hearts-verified-image-aria-label"
    Image={HeartsVerified}
    {...{ className, ariaHidden }}
  />
);

/** HeartsVerifiedImage's art flag-off; under Nova, devices across platforms. */
export const AddDevicesPlatformsImage = ({
  className,
  ariaHidden,
}: ImageProps) => (
  <PreparedImage
    ariaLabel="A computer and a mobile phone and a tablet with a pulsing heart on each"
    ariaLabelFtlId="hearts-verified-image-aria-label"
    Image={HeartsVerifiedPlatforms}
    {...{ className, ariaHidden }}
  />
);

export const BackupCodesImage = ({
  className,
  ariaHidden,
  illustrationsTheme,
}: ImageProps) => (
  <div style={illustrationStyle(illustrationsTheme)}>
    <PreparedImage
      ariaLabel="Document that contains hidden text."
      ariaLabelFtlId="signin-recovery-code-image-description"
      Image={BackupCodes}
      {...{ className, ariaHidden }}
    />
  </div>
);

export const BackupRecoveryPhoneImage = ({
  className,
  ariaHidden,
}: ImageProps) => (
  <PreparedImage
    ariaLabel="Mobile device that receives a code by text message."
    ariaLabelFtlId="recovery-phone-image-description"
    Image={BackupRecoveryPhone}
    {...{ className, ariaHidden }}
  />
);

export const BackupRecoveryPhoneCodeImage = ({
  className,
  ariaHidden,
  illustrationsTheme,
}: ImageProps) => (
  <div style={illustrationStyle(illustrationsTheme)}>
    <PreparedImage
      ariaLabel="Code received on a mobile device."
      ariaLabelFtlId="recovery-phone-code-image-description"
      Image={BackupRecoveryPhoneCode}
      {...{ className, ariaHidden }}
    />
  </div>
);

export const TwoFactorAuthImage = ({ className, ariaHidden }: ImageProps) => (
  <PreparedImage
    ariaLabel="A device with a hidden 6-digit code."
    ariaLabelFtlId="signin-totp-code-image-label"
    Image={TwoFactorAuth}
    {...{ className, ariaHidden }}
  />
);

/** `variant` picks the Nova art: `create` (default) or `confirm` (key verified). */
export const RecoveryKeyImage = ({
  className,
  ariaHidden,
  variant = 'create',
}: ImageProps & { variant?: 'create' | 'confirm' }) => (
  <PreparedImage
    ariaLabel="Illustration to represent an account recovery key."
    ariaLabelFtlId="recovery-key-image-aria-label"
    Image={variant === 'confirm' ? KeyConfirm : Key}
    {...{ ariaHidden, className }}
  />
);

export const PasswordImage = ({ className, ariaHidden }: ImageProps) => (
  <PreparedImage
    ariaLabel="Illustration to represent typing in a password."
    ariaLabelFtlId="password-image-aria-label"
    Image={Password}
    {...{ className, ariaHidden }}
  />
);

export const LightbulbImage = ({ className, ariaHidden }: ImageProps) => (
  <PreparedImage
    ariaLabel="Illustration to represent creating a storage hint."
    ariaLabelFtlId="lightbulb-aria-label"
    Image={Lightbulb}
    {...{ className, ariaHidden }}
  />
);

export const EmailCodeImage = ({
  className,
  ariaHidden,
  illustrationsTheme,
}: ImageProps) => (
  <div style={illustrationStyle(illustrationsTheme)}>
    <PreparedImage
      ariaLabel="Illustration to represent an email containing a code."
      ariaLabelFtlId="email-code-image-aria-label"
      Image={EmailCode}
      {...{ className, ariaHidden }}
    />
  </div>
);

export const PasswordSuccessImage = ({ className, ariaHidden }: ImageProps) => (
  <PreparedImage
    ariaLabel="Illustration to represent a successful password change."
    ariaLabelFtlId="password-success-image-aria-label"
    Image={PasswordSuccess}
    {...{ className, ariaHidden }}
  />
);

export const BackupRecoveryPhoneSmsImage = ({
  className,
  ariaHidden,
}: ImageProps) => (
  <PreparedImage
    ariaLabel="Mobile device with SMS text message capabilities"
    ariaLabelFtlId="backup-recovery-phone-image-aria-label"
    Image={BackupRecoveryPhoneSms}
    {...{ className, ariaHidden }}
  />
);

export const BackupAuthenticationCodesImage = ({
  className,
  ariaHidden,
}: ImageProps) => (
  <PreparedImage
    ariaLabel="Device screen with codes"
    ariaLabelFtlId="backup-authentication-codes-image-aria-label"
    Image={BackupAuthenticationCodes}
    {...{ className, ariaHidden }}
  />
);

export const SyncCloudsImage = ({ className, ariaHidden }: ImageProps) => (
  <PreparedImage
    ariaLabel="Clouds with a sync icon"
    ariaLabelFtlId="sync-clouds-image-aria-label"
    Image={SyncClouds}
    {...{ className, ariaHidden }}
  />
);

export const FallingConfettiImage = ({ ariaHidden }: ImageProps) => (
  <PreparedImage
    className="h-screen w-screen absolute top-0 left-0 pointer-events-none"
    ariaLabel="Animated falling confetti"
    ariaLabelFtlId="confetti-falling-image-aria-label"
    Image={FallingConfetti}
    {...{ ariaHidden }}
  />
);

export const VpnWelcomeImage = ({ className, ariaHidden }: ImageProps) => (
  <PreparedImage
    ariaLabel="Firefox window with a circular badge showing a green checkmark and “VPN,” showing the VPN is active."
    ariaLabelFtlId="vpn-welcome-image-aria-label"
    Image={VpnWelcome}
    {...{ className, ariaHidden }}
  />
);

export const SyncDevicesImage = ({ className, ariaHidden }: ImageProps) => (
  <PreparedImage
    ariaLabel="A desktop browser window and a mobile phone, both syncing, with the Firefox mascot alongside them"
    ariaLabelFtlId="sync-devices-image-aria-label"
    Image={SyncDevices}
    {...{ className, ariaHidden }}
  />
);

/**
 * The Firefox icon-plus-wordmark lockup. Its lettering is `currentColor`, so
 * callers set the text colour — e.g. `text-black dark:text-white` — while the
 * fox glyph keeps its gradients.
 */
export const FirefoxWordmarkImage = ({ className, ariaHidden }: ImageProps) => (
  <PreparedImage
    ariaLabel="Firefox logo"
    ariaLabelFtlId="firefox-wordmark-image-aria-label"
    Image={FirefoxWordmark}
    {...{ className, ariaHidden }}
  />
);

/*
 * The pairing illustrations below are decorative. The cards that render them
 * already carry their meaning in text, so WCAG 1.1.1 is met without a text
 * alternative and the artwork stays out of the accessibility tree.
 * `QrPhoneFrameImage` is only the phone around the scannable code, which
 * `Pair2/Authority/ScanQR` labels in its own right.
 *
 * `index.test.tsx` holds the matching list, so an image added without a label
 * fails there rather than shipping unlabelled.
 */

export const SyncSuccessImage = ({ className }: ImageProps) => (
  <PreparedImage ariaHidden Image={SyncSuccess} {...{ className }} />
);

export const PairingInterruptedImage = ({ className }: ImageProps) => (
  <PreparedImage ariaHidden Image={PairingInterrupted} {...{ className }} />
);

export const LaptopQrCodeImage = ({ className }: ImageProps) => (
  <PreparedImage ariaHidden Image={LaptopQrCode} {...{ className }} />
);

export const MobileDevicePairingImage = ({ className }: ImageProps) => (
  <PreparedImage ariaHidden Image={MobileDevicePairing} {...{ className }} />
);

export const QrPhoneFrameImage = ({ className }: ImageProps) => (
  <PreparedImage ariaHidden Image={QrPhoneFrame} {...{ className }} />
);

export const PairMenuIosImage = ({ className }: ImageProps) => (
  <PreparedImage ariaHidden Image={PairMenuIos} {...{ className }} />
);

export const PairMenuAndroidImage = ({ className }: ImageProps) => (
  <PreparedImage ariaHidden Image={PairMenuAndroid} {...{ className }} />
);
