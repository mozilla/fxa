/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState } from 'react';
import * as Sentry from '@sentry/browser';
import { RelierCmsInfo, useFtlMsgResolver } from '../../models';
import { FtlMsg } from 'fxa-react/lib/utils';
import { downloadTextFile } from '../../lib/download';
import Banner from '../Banner';
import CmsButtonWithFallback from '../CmsButtonWithFallback';

interface ButtonDownloadRecoveryKeyProps {
  navigateForward?: () => void;
  recoveryKeyValue: string;
  email: string;
  cmsInfo?: RelierCmsInfo;
}

const FILENAME_EXTENSION = '.txt';
// Arbitrary, but well under the 260 character Windows path limit.
const MAX_FILENAME_LENGTH = 75;

export const getFilename = (email: string) => {
  const date = new Date().toISOString().split('T')[0];
  // FxA permits "/" in an email local part, so don't rely on the browser
  // alone to reduce the download hint to a safe leaf name.
  const safeEmail = email.replace(/[^\w.@+-]/g, '_');
  const stem = `Mozilla-Recovery-Key_${date}_${safeEmail}`.slice(
    0,
    MAX_FILENAME_LENGTH - FILENAME_EXTENSION.length
  );

  return stem + FILENAME_EXTENSION;
};

export const ButtonDownloadRecoveryKey = ({
  navigateForward,
  recoveryKeyValue,
  email,
  cmsInfo,
}: ButtonDownloadRecoveryKeyProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const [localizedError, setLocalizedError] = useState('');

  const handleDownloadClick = () => {
    try {
      downloadTextFile(recoveryKeyValue, getFilename(email));
    } catch (error) {
      // The key is the only way back into encrypted Sync data, so a systemic
      // failure here needs to be visible in aggregate, not just to the user.
      Sentry.captureException(error);
      // Not useAlertBar: <AlertBar /> is only mounted by SettingsLayout, and
      // two of the three screens using this button render under AppLayout.
      setLocalizedError(
        ftlMsgResolver.getMsg(
          'recovery-key-pdf-download-error',
          'Sorry, there was a problem downloading your account recovery key.'
        )
      );
      return;
    }

    setLocalizedError('');
    navigateForward?.();
  };

  return (
    <>
      {localizedError && (
        <Banner
          type="error"
          content={{ localizedDescription: localizedError }}
        />
      )}
      <FtlMsg id="recovery-key-download-button-v4">
        <CmsButtonWithFallback
          className="w-full mt-4"
          onClick={handleDownloadClick}
          buttonColor={cmsInfo?.shared.buttonColor}
          data-glean-id="account_pref_recovery_key_download"
        >
          Download and continue
        </CmsButtonWithFallback>
      </FtlMsg>
    </>
  );
};

export default ButtonDownloadRecoveryKey;
