/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { Suspense, lazy } from 'react';
import {
  FolderIconListItem,
  GlobeIconListItem,
  LockIconListItem,
  PrinterIconListItem,
} from '../IconListItem';
import { FtlMsg } from 'fxa-react/lib/utils';
import DataBlock from '../DataBlock';
import { logViewEvent } from '../../lib/metrics';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

interface RecoveryKeySetupDownloadProps {
  navigateForward: () => void;
  recoveryKeyValue: string;
  viewName: string;
  email: string;
}

const spinner = (
  <LoadingSpinner className="bg-grey-20 flex items-center flex-col justify-center select-none" />
);

const ButtonDownloadRecoveryKeyPDF = lazy(
  () => import('../ButtonDownloadRecoveryKeyPDF')
);

export const InlineRecoveryKeySetupDownload = ({
  recoveryKeyValue,
  email,
  navigateForward,
  viewName,
}: RecoveryKeySetupDownloadProps) => {
  return (
    <>
      <div className="rounded p-2 text-sm border-2 border-grey-100">
        <DataBlock
          value={recoveryKeyValue}
          onAction={() =>
            logViewEvent(`flow.${viewName}`, `recovery-key.copy-option`)
          }
          isInline
          {...{ email }}
          gleanDataAttrs={{
            copy: {
              id: 'account_pref_recovery_key_copy',
            },
          }}
        />
        <div className="mx-2">
          <FtlMsg id="flow-recovery-key-download-storage-ideas-heading-v2">
            <h3 id="key-storage-ideas" className="font-semibold mb-2 mt-3">
              Places to store your key:
            </h3>
          </FtlMsg>
          <ul aria-labelledby="key-storage-ideas" className="flex flex-wrap">
            <FolderIconListItem listItemClassnames="mobileLandscape:basis-1/2">
              <FtlMsg id="flow-recovery-key-download-storage-ideas-folder-v2">
                Folder on secure device
              </FtlMsg>
            </FolderIconListItem>
            <PrinterIconListItem listItemClassnames="mobileLandscape:basis-1/2">
              <FtlMsg id="flow-recovery-key-download-storage-ideas-print-v2">
                Printed physical copy
              </FtlMsg>
            </PrinterIconListItem>
            <GlobeIconListItem listItemClassnames="mobileLandscape:basis-1/2">
              <FtlMsg id="flow-recovery-key-download-storage-ideas-cloud">
                Trusted cloud storage
              </FtlMsg>
            </GlobeIconListItem>
            <LockIconListItem listItemClassnames="mobileLandscape:basis-1/2">
              <FtlMsg id="flow-recovery-key-download-storage-ideas-pwd-manager">
                Password manager
              </FtlMsg>
            </LockIconListItem>
          </ul>
        </div>
      </div>

      <Suspense fallback={spinner}>
        <ButtonDownloadRecoveryKeyPDF
          {...{ navigateForward, recoveryKeyValue, viewName, email }}
        />
      </Suspense>

      <FtlMsg id="flow-recovery-key-download-next-link-v2">
        <button
          className="text-sm link-blue text-center mt-6 mx-auto"
          onClick={() => {
            logViewEvent(`flow.${viewName}`, 'recovery-key.skip-download');
            navigateForward();
          }}
        >
          Continue without downloading
        </button>
      </FtlMsg>
    </>
  );
};

export default InlineRecoveryKeySetupDownload;
