/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import classNames from 'classnames';
import { useFtlMsgResolver } from '../../../models';
import {
  AlertFullIcon as AlertIcon,
  BackupCodesDisabledIcon,
  BackupCodesIcon,
  BackupRecoverySmsDisabledIcon,
  BackupRecoverySmsIcon,
  CheckmarkGreenIcon,
  LightbulbIcon,
} from '../../Icons';
import { FtlMsg } from 'fxa-react/lib/utils';
import { ButtonIconTrash } from '../ButtonIcon';

type SubRowProps = {
  ctaGleanId: string;
  ctaMessage: string;
  icon: React.ReactNode;
  idPrefix: string;
  isEnabled: boolean;
  localizedRowTitle: string;
  localizedDeleteIconTitle?: string;
  message: React.ReactNode;
  onCtaClick: () => void;
  onDeleteClick?: () => void;
} & (
  | { localizedDescription: string; localizedInfoMessage?: never }
  | { localizedDescription?: never; localizedInfoMessage: string }
  | { localizedDescription?: never; localizedInfoMessage?: never }
);

const SubRow = ({
  ctaGleanId,
  ctaMessage,
  icon,
  idPrefix,
  isEnabled,
  localizedDescription,
  localizedInfoMessage,
  message,
  onCtaClick,
  onDeleteClick,
  localizedRowTitle,
  localizedDeleteIconTitle,
}: SubRowProps) => {
  const StatusIcon = () => (
    <span className="grow-0 shrink-0 ">
      {isEnabled ? (
        <CheckmarkGreenIcon className="mt-1" mode="enabled" />
      ) : (
        <AlertIcon className="m-0" mode="attention" />
      )}
    </span>
  );

  return (
    <div
      className={classNames(
        'flex flex-col w-full max-w-full mt-8 p-2 @mobileLandscape/unitRow:mt-4 @mobileLandscape/unitRow:rounded-lg border items-start text-sm gap-2',
        {
          'bg-grey-10 border-transparent': !isEnabled,
          'bg-white border-grey-100': isEnabled,
        }
      )}
    >
      <div
        className={classNames(
          'flex flex-col @mobileLandscape/unitRow:flex-row w-full max-w-full items-start text-sm gap-4'
        )}
        data-testid={`${idPrefix}-sub-row`}
      >
        <div className="flex flex-row justify-between flex-1 flex-wrap items-center">
          <div className="flex items-center gap-2">
            <div className="grow-0 shrink-0">{icon}</div>
            <p className="font-semibold">{localizedRowTitle}</p>
          </div>
          <div className="flex items-center gap-1">
            <StatusIcon />
            {message}
          </div>
          {localizedDescription && (
            <p className="text-xs w-full mx-2 mt-1">{localizedDescription}</p>
          )}
        </div>
        <button
          className="cta-base-common cta-neutral cta-base-p shrink-0 mt-0 w-full @mobileLandscape/unitRow:w-auto @mobileLandscape/unitRow:text-xs @mobileLandscape/unitRow:py-1 @mobileLandscape/unitRow:px-5 @mobileLandscape/unitRow:mt-0"
          onClick={onCtaClick}
          data-glean-id={ctaGleanId}
        >
          {ctaMessage}
        </button>
        {onDeleteClick && localizedDeleteIconTitle && (
          <>
            <div className="@mobileLandscape/unitRow:hidden">
              <FtlMsg id="tfa-row-backup-phone-delete-button">
                <button
                  className="cta-base-common cta-neutral cta-base-p shrink-0 -mt-2 w-full"
                  onClick={onDeleteClick}
                  title={localizedDeleteIconTitle}
                  data-testid={`${idPrefix}-delete-button`}
                >
                  Remove
                </button>
              </FtlMsg>
            </div>
            <div className="hidden @mobileLandscape/unitRow:flex">
              <ButtonIconTrash
                onClick={onDeleteClick}
                title={localizedDeleteIconTitle}
                data-testid={`${idPrefix}-delete-button`}
              />
            </div>
          </>
        )}
      </div>
      {localizedInfoMessage && (
        <div className="flex w-full max-w-full gap-2 bg-gradient-to-tr from-blue-600/10 to-purple-500/10 rounded-md l py-2 px-4 mt-1 items-center">
          <LightbulbIcon className="shrink-0" />
          <p className="text-xs">{localizedInfoMessage}</p>
        </div>
      )}
    </div>
  );
};

export const BackupCodesSubRow = ({
  numCodesAvailable,
  onCtaClick,
}: Pick<SubRowProps, 'onCtaClick'> & {
  numCodesAvailable?: number;
}) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const hasCodesRemaining = !!numCodesAvailable && numCodesAvailable > 0;
  const icon = hasCodesRemaining ? (
    <BackupCodesIcon className="-ms-1 -my-2 scale-50" />
  ) : (
    <BackupCodesDisabledIcon className="-ms-1 -my-2 scale-50" />
  );
  const message = hasCodesRemaining ? (
    <FtlMsg id="tfa-row-backup-codes-available" vars={{ numCodesAvailable }}>
      <p>{`${numCodesAvailable} codes remaining`}</p>
    </FtlMsg>
  ) : (
    <FtlMsg id="tfa-row-backup-codes-not-available">
      <p>No codes available</p>
    </FtlMsg>
  );
  const ctaMessage = hasCodesRemaining
    ? ftlMsgResolver.getMsg('tfa-row-backup-codes-get-new-cta', 'Get new codes')
    : ftlMsgResolver.getMsg('tfa-row-backup-codes-add-cta', 'Add');

  const ctaGleanId = hasCodesRemaining
    ? 'account_pref_two_step_auth_codes_get_new_submit'
    : 'account_pref_two_step_auth_codes_add_submit';

  return (
    <SubRow
      {...{
        ctaGleanId,
        ctaMessage,
        icon,
        message,
        onCtaClick,
      }}
      idPrefix="backup-authentication-codes"
      localizedRowTitle={ftlMsgResolver.getMsg(
        'tfa-row-backup-codes-title',
        'Backup authentication codes'
      )}
      isEnabled={hasCodesRemaining}
      localizedDescription={ftlMsgResolver.getMsg(
        'tfa-row-backup-codes-description',
        'This is the safest recovery method if you canʼt access your mobile device or authenticator app.'
      )}
    />
  );
};

export const BackupPhoneSubRow = ({
  phoneNumber,
  onCtaClick,
  onDeleteClick,
  // description should only be shown when the user can chooses between two backup methods
  // info message should only be shown when the user can't delete the phone number
  showExtraInfo,
}: Pick<SubRowProps, 'onCtaClick' | 'onDeleteClick'> & {
  phoneNumber?: string;
  showExtraInfo?: 'description' | 'info';
}) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const hasPhoneNumber = !!phoneNumber;
  const icon = hasPhoneNumber ? (
    <BackupRecoverySmsIcon className="-ms-1 -my-2 scale-50" />
  ) : (
    <BackupRecoverySmsDisabledIcon className="-ms-1 -my-2 scale-50" />
  );
  const message = hasPhoneNumber ? (
    // We will likely want to only retrieve the last 4 digits of the phone number from the backend
    // but adding a slice here just in case to ensure only the last 4 digits are displayed
    // u2022 is a bullet point character
    // this format works for a North American phone number, but may need to be adjusted for other formats
    // durring next phases of SMS feature rollout
    // Phone numbers should always be displayed left-to-right, including in rtl languages
    <p dir="ltr">{`\u2022\u2022\u2022 \u2022\u2022\u2022 ${phoneNumber.slice(
      -4
    )}`}</p>
  ) : (
    <FtlMsg id="tfa-row-backup-phone-not-available">
      <p>No recovery phone number available</p>
    </FtlMsg>
  );
  const ctaMessage = hasPhoneNumber
    ? ftlMsgResolver.getMsg('tfa-row-backup-phone-change-cta', 'Change')
    : ftlMsgResolver.getMsg('tfa-row-backup-phone-add-cta', 'Add');

  const ctaGleanId = hasPhoneNumber
    ? 'account_pref_two_step_auth_phone_change_submit'
    : 'account_pref_two_step_auth_phone_add_submit';

  const localizedDeleteIconTitle = ftlMsgResolver.getMsg(
    'tfa-row-backup-phone-delete-title',
    'Remove backup recovery phone'
  );

  return (
    <SubRow
      idPrefix="backup-recovery-phone"
      isEnabled={hasPhoneNumber}
      {...(showExtraInfo === 'info'
        ? {
            localizedInfoMessage: ftlMsgResolver.getMsg(
              'tfa-row-backup-phone-delete-restriction',
              'If you need to remove your phone number as a backup recovery option, first add backup authentication codes or disable two-step authentication to prevent account lockout.'
            ),
          }
        : showExtraInfo === 'description'
        ? {
            localizedDescription: ftlMsgResolver.getMsg(
              'tfa-row-backup-phone-description',
              'This is the easier method if you canʼt use your authenticator app, because you will receive an instant recovery code via text message, eliminating the need to save backup authentication codes.'
            ),
          }
        : null)}
      {...{
        ctaGleanId,
        ctaMessage,
        icon,
        message,
        onCtaClick,
        onDeleteClick,
        localizedDeleteIconTitle,
      }}
      localizedRowTitle={ftlMsgResolver.getMsg(
        'tfa-row-backup-phone-title',
        'Backup recovery phone'
      )}

      // TODO : Need to add:
      // - sim swap risk link
      // need to fix - limited support for container queries
      // jest test not respecting the container query
    />
  );
};

export default SubRow;
