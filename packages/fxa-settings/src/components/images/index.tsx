/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { ImageProps, PreparedImage } from '../PreparedImage';
import { ReactComponent as HeartsBroken } from './graphic_hearts_broken.svg';
import { ReactComponent as HeartsVerified } from './graphic_hearts_verified.svg';
import { ReactComponent as RecoveryCodes } from './graphic_recovery_codes.svg';
import { ReactComponent as TwoFactorAuth } from './graphic_two_factor_auth.svg';
import { ReactComponent as PushFactorAuth } from './graphic_push_factor_auth.svg';
import { ReactComponent as Mail } from './graphic_mail.svg';
import { ReactComponent as Key } from './graphic_recovery_key.min.svg';
import { ReactComponent as Password } from './graphic_password.min.svg';
import { ReactComponent as Lightbulb } from './graphic_recovery_key_hint.min.svg';
import { ReactComponent as EmailCode } from './graphic_email_code.svg';
import { ReactComponent as PasswordSuccess } from './graphic_password_success.min.svg';

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

export const RecoveryCodesImage = ({ className, ariaHidden }: ImageProps) => (
  <PreparedImage
    ariaLabel="Document that contains hidden text."
    ariaLabelFtlId="signin-recovery-code-image-description"
    Image={RecoveryCodes}
    {...{ className, ariaHidden }}
  />
);

export const TwoFactorAuthImage = ({ className, ariaHidden }: ImageProps) => (
  <PreparedImage
    ariaLabel="A device with a hidden 6-digit code."
    ariaLabelFtlId="signin-totp-code-image-label"
    Image={TwoFactorAuth}
    {...{ className, ariaHidden }}
  />
);

export const PushAuthImage = ({ className, ariaHidden }: ImageProps) => (
  <PreparedImage
    ariaLabel="A device that recieved a push notification."
    ariaLabelFtlId="signin-push-code-image-label"
    Image={PushFactorAuth}
    {...{ className, ariaHidden }}
  />
);

export const MailImage = ({ className, ariaHidden }: ImageProps) => (
  <PreparedImage
    ariaLabel="An envelope containing a link"
    ariaLabelFtlId="confirm-signup-aria-label"
    Image={Mail}
    {...{ className, ariaHidden }}
  />
);

export const RecoveryKeyImage = ({ className, ariaHidden }: ImageProps) => (
  <PreparedImage
    ariaLabel="Illustration to represent an account recovery key."
    ariaLabelFtlId="recovery-key-image-aria-label"
    Image={Key}
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

export const EmailCodeImage = ({ className, ariaHidden }: ImageProps) => (
  <PreparedImage
    ariaLabel="Illustration to represent an email containing a code."
    ariaLabelFtlId="email-code-image-aria-label"
    Image={EmailCode}
    {...{ className, ariaHidden }}
  />
);

export const PasswordSuccessImage = ({ className, ariaHidden }: ImageProps) => (
  <PreparedImage
    ariaLabel="Illustration to represent a successful password change."
    ariaLabelFtlId="password-success-image-aria-label"
    Image={PasswordSuccess}
    {...{ className, ariaHidden }}
  />
);
