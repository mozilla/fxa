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
  CheckmarkGreenIcon,
} from '../../Icons';
import { FtlMsg } from 'fxa-react/lib/utils';

export type SubRowProps = {
  ctaGleanId: string;
  ctaMessage: string;
  icon: React.ReactNode;
  idPrefix: string;
  isEnabled: boolean;
  localizedDescription: string;
  message: React.ReactNode;
  onCtaClick: () => void;
  showDescription?: boolean;
  title: string;
};

const SubRow = ({
  ctaGleanId,
  ctaMessage,
  icon,
  idPrefix,
  isEnabled,
  localizedDescription,
  message,
  onCtaClick,
  showDescription,
  title,
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
        'flex flex-col @mobileLandscape/unitRow:flex-row w-full max-w-full mt-8 p-2 @mobileLandscape/unitRow:mt-4 @mobileLandscape/unitRow:rounded-lg border items-start text-sm gap-4',
        {
          'bg-grey-10 border-transparent': !isEnabled,
          'bg-white border-grey-100': isEnabled,
          '@mobileLandscape/unitRow:items-center': !showDescription,
        }
      )}
      data-testid={`${idPrefix}-sub-row`}
    >
      <div className="flex flex-row justify-between flex-1 flex-wrap items-center">
        <div className="flex items-center gap-2">
          <div className="grow-0 shrink-0">{icon}</div>
          <p className="font-semibold">{title}</p>
        </div>
        <div className="flex items-center gap-1">
          <StatusIcon />
          {message}
        </div>
        {showDescription && (
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
    </div>
  );
};

export const BackupCodesSubRow = ({
  numCodesAvailable,
  onCtaClick,
  showDescription,
}: Pick<SubRowProps, 'onCtaClick' | 'showDescription'> & {
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
        showDescription,
      }}
      idPrefix="backup-authentication-codes"
      title="Backup authentication codes"
      isEnabled={hasCodesRemaining}
      localizedDescription={ftlMsgResolver.getMsg(
        'tfa-row-backup-codes-description',
        'This is the safest recovery method if you canʼt access your mobile device or authenticator app.'
      )}
    />
  );
};

export default SubRow;
