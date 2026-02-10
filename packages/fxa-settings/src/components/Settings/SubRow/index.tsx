/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { useAlertBar, useFtlMsgResolver } from '../../../models';
import { MfaGuard } from '../MfaGuard';
import { MfaReason } from '../../../lib/types';
import {
  AlertFullIcon as AlertIcon,
  BackupCodesDisabledIcon,
  BackupCodesIcon,
  BackupRecoverySmsDisabledIcon,
  BackupRecoverySmsIcon,
  CheckmarkGreenIcon,
  LightbulbIcon,
  PasskeyIcon,
} from '../../Icons';
import {
  FtlMsg,
  getLocalizedDate,
  LocalizedDateOptions,
} from 'fxa-react/lib/utils';
import { ButtonIconTrash } from '../ButtonIcon';
import LinkExternal, {
  LinkExternalProps,
} from 'fxa-react/components/LinkExternal';
import { useBooleanState } from 'fxa-react/lib/hooks';
import Modal from '../Modal';

type SubRowProps = {
  ctaMessage?: string;
  onCtaClick?: () => void;
  ctaGleanId?: string;
  ctaTestId?: string;
  icon: React.ReactNode;
  idPrefix: string;
  statusIcon?: 'checkmark' | 'alert';
  border?: boolean;
  localizedRowTitle: string;
  localizedDeleteIconTitle?: string;
  message?: React.ReactNode;
  onDeleteClick?: React.MouseEventHandler<HTMLButtonElement>;
  localizedDescription?: React.ReactNode;
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
  statusIcon = undefined,
  border = true,
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
      {statusIcon === 'checkmark' ? (
        <CheckmarkGreenIcon className="mt-1" mode="enabled" />
      ) : statusIcon === 'alert' ? (
        <AlertIcon className="m-0" mode="attention" />
      ) : null}
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
          'bg-grey-10 border-transparent': !border,
          'bg-white border-grey-100': border,
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
            <div
              className="flex items-center gap-1"
              data-testid={`${idPrefix}-status`}
            >
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
        <div className="flex w-full max-w-full mt-2 gap-2 bg-gradient-to-tr from-blue-600/10 to-purple-500/10 rounded-md py-2 px-4 items-center">
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
      statusIcon={hasCodesRemaining ? 'checkmark' : 'alert'}
      border={hasCodesRemaining}
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
      statusIcon={hasPhoneNumber ? 'checkmark' : 'alert'}
      border={hasPhoneNumber}
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

// TODO: replace with actual Passkey type when available
type Passkey = {
  id: string;
  name: string;
  createdAt: number;
  lastUsed?: number;
  canSync: boolean;
};

export type PasskeySubRowProps = {
  passkey: Passkey;
  // passing in as a prop for the sake of mocking.
  // TODO: replace with actual auth client API call
  deletePasskey?: (passkeyId: string) => Promise<void>;
};

const formatDateText = (timestamp: number): string => {
  return Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(timestamp));
};

export const PasskeySubRow = ({
  passkey,
  deletePasskey = async (passkeyId: string) => {},
}: PasskeySubRowProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const alertBar = useAlertBar();
  const [deleteModalRevealed, revealDeleteModal, hideDeleteModal] =
    useBooleanState();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleConfirmDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await deletePasskey(passkey.id);
      // a hack to avoid alert bar being immediately removed
      setTimeout(() => {
        alertBar.success(
          ftlMsgResolver.getMsg('passkey-delete-success', 'Passkey deleted')
        );
      }, 0);
    } catch (error) {
      setTimeout(() => {
        alertBar.error(
          // TODO: replace with more specific error messages based on error type
          ftlMsgResolver.getMsg(
            'passkey-delete-error',
            'There was a problem deleting your passkey. Try again in a few minutes.'
          )
        );
      }, 0);
    } finally {
      setIsDeleting(false);
      hideDeleteModal();
    }
  }, [passkey.id, deletePasskey, alertBar, ftlMsgResolver, hideDeleteModal]);

  const createdDateFluent = getLocalizedDate(
    passkey.createdAt,
    LocalizedDateOptions.NumericDate
  );

  const createdDateText = formatDateText(passkey.createdAt);

  const lastUsedDateFluent = passkey.lastUsed
    ? getLocalizedDate(passkey.lastUsed, LocalizedDateOptions.NumericDate)
    : undefined;

  const lastUsedText = passkey.lastUsed
    ? formatDateText(passkey.lastUsed)
    : undefined;

  const localizedDescription = (
    <span className="flex flex-col gap-1 mobileLandscape:flex-row mobileLandscape:gap-12">
      <FtlMsg
        id="passkey-sub-row-created-date"
        vars={{ createdDate: createdDateFluent }}
      >
        <span>Created: {createdDateText}</span>
      </FtlMsg>
      {lastUsedText && lastUsedDateFluent && (
        <FtlMsg
          id="passkey-sub-row-last-used-date"
          vars={{ lastUsedDate: lastUsedDateFluent }}
        >
          <span>Last used: {lastUsedText}</span>
        </FtlMsg>
      )}
    </span>
  );

  return (
    <>
      <SubRow
        idPrefix="passkey"
        icon={
          <PasskeyIcon ariaHidden className="h-8 w-5 ms-2 text-purple-600" />
        }
        localizedRowTitle={passkey.name}
        localizedDescription={localizedDescription}
        {...(!passkey.canSync && {
          statusIcon: 'alert',
          message: (
            <FtlMsg id="passkey-sub-row-sign-in-only">
              <p>Sign in only. Can’t be used to sync.</p>
            </FtlMsg>
          ),
        })}
        onDeleteClick={(event) => {
          event.stopPropagation();
          revealDeleteModal();
        }}
        localizedDeleteIconTitle={ftlMsgResolver.getMsg(
          'passkey-sub-row-delete-title',
          'Delete passkey'
        )}
      />
      {deleteModalRevealed && (
        <MfaGuard
          // TODO: replace with actual required scope and reason when available
          requiredScope="test"
          onDismissCallback={async () => {
            hideDeleteModal();
          }}
          reason={MfaReason.test}
        >
          <Modal
            onDismiss={hideDeleteModal}
            hasButtons={false}
            headerId="passkey-delete-header"
            descId="passkey-delete-desc"
          >
            <FtlMsg id="passkey-delete-modal-heading">
              <h2
                id="passkey-delete-header"
                className="font-bold text-xl mb-2 -mt-2 mx-4"
              >
                Delete your passkey?
              </h2>
            </FtlMsg>
            <FtlMsg id="passkey-delete-modal-content">
              <p className="mb-10 mx-4">
                This passkey will be removed from your account. You’ll need to
                sign in using a different way.
              </p>
            </FtlMsg>
            <div className="flex justify-center mx-2 mt-6">
              <FtlMsg id="passkey-delete-modal-cancel-button">
                <button
                  className="cta-neutral mx-2 flex-1 cta-xl"
                  onClick={hideDeleteModal}
                >
                  Cancel
                </button>
              </FtlMsg>
              <FtlMsg id="passkey-delete-modal-confirm-button">
                <button
                  className="cta-caution mx-2 flex-1 cta-xl"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  // to avoid clashing with other delete buttons
                  data-testid="confirm-delete-passkey-button"
                >
                  Delete passkey
                </button>
              </FtlMsg>
            </div>
          </Modal>
        </MfaGuard>
      )}
    </>
  );
};

export default SubRow;
