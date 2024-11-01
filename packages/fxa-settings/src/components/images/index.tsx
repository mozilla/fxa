/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { ReactComponent as HeartsBroken } from './graphic_hearts_broken.svg';
import { ReactComponent as HeartsVerified } from './graphic_hearts_verified.svg';
import { ReactComponent as BackupCodes } from './graphic_backup_codes.min.svg';
import { ReactComponent as TwoFactorAuth } from './graphic_two_factor_auth.svg';
import { ReactComponent as PushFactorAuth } from './graphic_push_factor_auth.svg';
import { ReactComponent as Mail } from './graphic_mail.svg';
import { ReactComponent as Key } from './graphic_recovery_key.min.svg';
import { ReactComponent as Password } from './graphic_password.min.svg';
import { ReactComponent as Lightbulb } from './graphic_recovery_key_hint.min.svg';
import { ReactComponent as EmailCode } from './graphic_email_code.svg';
import { ReactComponent as CircleCheckOutline } from './icon_checkmark_circle_outline.svg';
import { ReactComponent as CircleCheckFull } from './icon_checkmark_circle_full.svg';
import { ReactComponent as PasswordSuccess } from './graphic_password_success.min.svg';
import { ReactComponent as BackupRecoveryPhone } from './graphic_backup_recovery_phone.min.svg';
import { ReactComponent as BackupRecoveryPhoneCode } from './graphic_phone_code.min.svg';

import { FtlMsg } from 'fxa-react/lib/utils';

// Use this component to add your image into the collection of images exported below.
// If the component is not being reused across directories, it should remain in the directory
// where it is being used. If you are introducing an image which was previously shared and
// had localized alt-text, or a localized aria-label, please add the existing ftl id to spare
// translating it again. Don't forget to add new FTL strings into the `en.ftl` file!

interface PreparedImageBaseProps {
  className?: string;
  Image: React.ElementType;
}

interface PreparedImageAriaHiddenProps extends PreparedImageBaseProps {
  ariaHidden: true;
}

interface PreparedImageAriaVisibleProps extends PreparedImageBaseProps {
  ariaHidden?: false;
  ariaLabel: string;
  ariaLabelFtlId: string;
}

type PreparedImageProps =
  | PreparedImageAriaHiddenProps
  | PreparedImageAriaVisibleProps;

export const PreparedImage = (props: PreparedImageProps) => {
  const { className = 'm-auto w-3/5', ariaHidden, Image } = props;
  const showAriaLabel =
    !ariaHidden && props?.ariaLabel && props?.ariaLabelFtlId;

  return (
    <>
      {showAriaLabel ? (
        <FtlMsg id={props.ariaLabelFtlId} attrs={{ ariaLabel: true }}>
          <Image role="img" aria-label={props.ariaLabel} {...{ className }} />
        </FtlMsg>
      ) : (
        <Image aria-hidden data-testid="aria-hidden-image" {...{ className }} />
      )}
    </>
  );
};

export type ImageProps = {
  className?: string;
  ariaHidden?: boolean;
};

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

export const BackupCodesImage = ({ className, ariaHidden }: ImageProps) => (
  <PreparedImage
    ariaLabel="Document that contains hidden text."
    ariaLabelFtlId="signin-recovery-code-image-description"
    Image={BackupCodes}
    {...{ className, ariaHidden }}
  />
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
}: ImageProps) => (
  <PreparedImage
    ariaLabel="Code received on a mobile device."
    ariaLabelFtlId="recovery-phone-code-image-description"
    Image={BackupRecoveryPhoneCode}
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

export const CheckmarkCircleOutlineIcon = ({ className }: ImageProps) => (
  <PreparedImage
    Image={CircleCheckOutline}
    ariaHidden={true}
    {...{ className }}
  />
);

export const CheckmarkCircleFullIcon = ({ className }: ImageProps) => (
  <PreparedImage Image={CircleCheckFull} ariaHidden={true} {...{ className }} />
);
