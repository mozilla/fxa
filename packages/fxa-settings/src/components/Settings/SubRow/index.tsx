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
import LinkExternal, {
  LinkExternalProps,
} from 'fxa-react/components/LinkExternal';

type SubRowProps = {
  ctaGleanId: string;
  ctaMessage: string;
  ctaTestId: string;
  icon: React.ReactNode;
  idPrefix: string;
  isEnabled: boolean;
  localizedRowTitle: string;
  localizedDeleteIconTitle?: string;
  message: React.ReactNode;
  onCtaClick: () => void;
  onDeleteClick?: () => void;
  localizedDescription?: string;
  localizedInfoMessage?: string;
  linkExternalProps?: LinkExternalProps;
  deleteGleanId?: string;
};

export type BackupPhoneSubRowProps = Pick<
  SubRowProps,
  'onCtaClick' | 'onDeleteClick'
> & {
  phoneNumber?: string;
  showDescription?: boolean;
};

const SubRow = ({
  ctaGleanId,
  ctaMessage,
  ctaTestId,
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
  linkExternalProps,
  deleteGleanId,
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

  const ExtraInfoLink = () => {
    return linkExternalProps ? (
      <LinkExternal
        href={linkExternalProps.href}
        className="link-blue block"
        gleanDataAttrs={linkExternalProps.gleanDataAttrs}
      >
        {linkExternalProps.children}
      </LinkExternal>
    ) : null;
  };

  return (
    <div
      className={classNames(
        'flex flex-col w-full max-w-full mt-8 p-4 @mobileLandscape/unitRow:mt-4 @mobileLandscape/unitRow:rounded-lg border items-start text-sm gap-2',
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
          <div>
            <div className="flex items-center gap-1">
              <StatusIcon />
              {message}
            </div>
            {!localizedDescription &&
              !localizedInfoMessage &&
              linkExternalProps && <ExtraInfoLink />}
          </div>
          {localizedDescription && (
            <p className="text-sm w-full mx-2 mt-2">
              {localizedDescription}{' '}
              {!localizedInfoMessage && linkExternalProps && <ExtraInfoLink />}
            </p>
          )}
        </div>
        {ctaMessage && (
          <button
            className="cta-base-common cta-neutral cta-base-p shrink-0 mt-0 w-full @mobileLandscape/unitRow:w-auto @mobileLandscape/unitRow:text-xs @mobileLandscape/unitRow:py-1 @mobileLandscape/unitRow:px-5 @mobileLandscape/unitRow:mt-0"
            onClick={onCtaClick}
            data-glean-id={ctaGleanId}
            data-testid={ctaTestId}
          >
            {ctaMessage}
          </button>
        )}
        {onDeleteClick && localizedDeleteIconTitle && (
          <>
            <div className="@mobileLandscape/unitRow:hidden w-full shrink-0">
              <FtlMsg id="tfa-row-backup-phone-delete-button">
                <button
                  className="cta-base-common cta-neutral cta-base-p -mt-2 w-full"
                  onClick={onDeleteClick}
                  title={localizedDeleteIconTitle}
                  data-glean-id={deleteGleanId}
                >
                  Remove
                </button>
              </FtlMsg>
            </div>
            <div className="hidden @mobileLandscape/unitRow:flex">
              <ButtonIconTrash
                onClick={onDeleteClick}
                title={localizedDeleteIconTitle}
                {...(deleteGleanId && {
                  gleanDataAttrs: { id: deleteGleanId },
                })}
              />
            </div>
          </>
        )}
      </div>
      {localizedInfoMessage && (
        <div className="flex w-full max-w-full mt-2 gap-2 bg-gradient-to-tr from-blue-600/10 to-purple-500/10 rounded-md l py-2 px-4 mt-1 items-center">
          <LightbulbIcon className="shrink-0" />
          <p className="text-sm">
            {localizedInfoMessage}
            {linkExternalProps && <ExtraInfoLink />}
          </p>
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
    <FtlMsg id="tfa-row-backup-codes-available-v2" vars={{ numCodesAvailable }}>
      <p>{`${numCodesAvailable} code${
        numCodesAvailable === 1 ? '' : 's'
      } remaining`}</p>
    </FtlMsg>
  ) : (
    <FtlMsg id="tfa-row-backup-codes-not-available">
      <p>No codes available</p>
    </FtlMsg>
  );
  const ctaMessage = hasCodesRemaining
    ? ftlMsgResolver.getMsg(
        'tfa-row-backup-codes-get-new-cta-v2',
        'Create new codes'
      )
    : ftlMsgResolver.getMsg('tfa-row-backup-codes-add-cta', 'Add');

  const ctaGleanId = hasCodesRemaining
    ? 'account_pref_two_step_auth_codes_get_new_submit'
    : 'account_pref_two_step_auth_codes_add_submit';

  const ctaTestId = hasCodesRemaining
    ? 'backup-codes-get-new-button'
    : 'backup-codes-add-button';

  return (
    <SubRow
      {...{
        ctaGleanId,
        ctaMessage,
        ctaTestId,
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
        'tfa-row-backup-codes-description-2',
        'This is the safest recovery method if you canʼt use your mobile device or authenticator app.'
      )}
    />
  );
};

export const BackupPhoneSubRow = ({
  phoneNumber,
  onCtaClick,
  onDeleteClick,
}: BackupPhoneSubRowProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const hasPhoneNumber = !!phoneNumber;
  const icon = hasPhoneNumber ? (
    <BackupRecoverySmsIcon className="-ms-1 -my-2 scale-50" />
  ) : (
    <BackupRecoverySmsDisabledIcon className="-ms-1 -my-2 scale-50" />
  );
  const message = hasPhoneNumber ? (
    // Phone numbers should always be displayed left-to-right, *including* in rtl languages
    <p dir="ltr">{phoneNumber}</p>
  ) : (
    <FtlMsg id="tfa-row-backup-phone-not-available-v2">
      <p>No phone number added</p>
    </FtlMsg>
  );
  const ctaMessage = hasPhoneNumber
    ? ftlMsgResolver.getMsg('tfa-row-backup-phone-change-cta', 'Change')
    : ftlMsgResolver.getMsg('tfa-row-backup-phone-add-cta', 'Add');

  const ctaGleanId = hasPhoneNumber
    ? 'account_pref_two_step_auth_phone_change_submit'
    : 'account_pref_two_step_auth_phone_add_submit';

  const ctaTestId = hasPhoneNumber
    ? 'recovery-phone-change-button'
    : 'recovery-phone-add-button';

  // Do not display 'delete' button if user does not have a phone number
  const localizedDeleteIconTitle = hasPhoneNumber
    ? ftlMsgResolver.getMsg(
        'tfa-row-backup-phone-delete-title-v2',
        'Remove recovery phone'
      )
    : undefined;

  const linkExternalProps = !hasPhoneNumber
    ? {
        href: 'https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication',
        children: ftlMsgResolver.getMsg(
          'tfa-row-backup-phone-sim-swap-risk-link',
          'Learn about SIM swap risk'
        ),
        gleanDataAttrs: {
          id: 'account_pref_two_step_auth_phone_learn_more_link',
        },
      }
    : undefined;

  return (
    <SubRow
      idPrefix="backup-recovery-phone"
      isEnabled={hasPhoneNumber}
      {...(hasPhoneNumber && !onDeleteClick
        ? {
            // info message should only be shown when a phone number is set and the user can't delete it
            // (i.e. when the user has no other recovery method)
            localizedInfoMessage: ftlMsgResolver.getMsg(
              'tfa-row-backup-phone-delete-restriction-v2',
              'If you want to remove your recovery phone, add backup authentication codes or disable two-step authentication first to avoid getting locked out of your account.'
            ),
          }
        : null)}
      localizedDescription={ftlMsgResolver.getMsg(
        'tfa-row-backup-phone-description-v2',
        'This is the easiest recovery method if you canʼt use your authenticator app.'
      )}
      {...{
        ctaGleanId,
        ctaMessage,
        ctaTestId,
        icon,
        message,
        onCtaClick,
        onDeleteClick,
        localizedDeleteIconTitle,
        linkExternalProps,
      }}
      localizedRowTitle={ftlMsgResolver.getMsg(
        'tfa-row-backup-phone-title-v2',
        'Recovery phone'
      )}
      deleteGleanId="account_pref_two_step_auth_phone_remove_submit"
    />
  );
};

export default SubRow;
