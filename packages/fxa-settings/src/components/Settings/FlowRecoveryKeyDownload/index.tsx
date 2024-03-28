/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { Suspense, lazy } from 'react';
import FlowContainer from '../FlowContainer';
import ProgressBar from '../ProgressBar';
import DataBlock from '../../DataBlock';
import { Link } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { RecoveryKeyImage } from '../../images';
import { logViewEvent } from '../../../lib/metrics';
import {
  FolderIconListItem,
  GlobeIconListItem,
  LockIconListItem,
  PrinterIconListItem,
} from '../../IconListItem';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

const ButtonDownloadRecoveryKeyPDF = lazy(
  () => import('../../ButtonDownloadRecoveryKeyPDF')
);

// TODO FXA-8305
const spinner = (
  <LoadingSpinner className="bg-grey-20 flex items-center flex-col justify-center h-screen select-none" />
);

export type FlowRecoveryKeyDownloadProps = {
  localizedBackButtonTitle: string;
  localizedPageTitle: string;
  navigateBackward: () => void;
  navigateForward: () => void;
  recoveryKeyValue: string;
  viewName: string;
  email: string;
};

export const FlowRecoveryKeyDownload = ({
  localizedBackButtonTitle,
  localizedPageTitle,
  navigateBackward,
  navigateForward,
  recoveryKeyValue,
  viewName,
  email,
}: FlowRecoveryKeyDownloadProps) => {
  return (
    <FlowContainer
      title={localizedPageTitle}
      onBackButtonClick={() => {
        navigateBackward();
        logViewEvent(`flow.${viewName}`, 'recovery-key.skip-download');
      }}
      {...{ localizedBackButtonTitle }}
    >
      <div className="w-full flex flex-col gap-4">
        <ProgressBar currentStep={3} numberOfSteps={4} />
        <RecoveryKeyImage className="my-6 mx-auto" />

        <FtlMsg id="flow-recovery-key-download-heading-v2">
          <h2 className="font-bold text-xl">
            Account recovery key created — Download and store it now
          </h2>
        </FtlMsg>
        <FtlMsg id="flow-recovery-key-download-info-v2">
          <p>
            This key allows you to recover your data if you forget your
            password. Download it now and store it somewhere you’ll remember —
            you won’t be able to return to this page later.
          </p>
        </FtlMsg>
        <DataBlock
          value={recoveryKeyValue}
          onAction={() =>
            logViewEvent(`flow.${viewName}`, `recovery-key.copy-option`)
          }
          isInline
          {...{ email }}
        />
        <div className="bg-grey-10 p-4 rounded-lg text-grey-400 text-sm">
          <FtlMsg id="flow-recovery-key-download-storage-ideas-heading-v2">
            <h3 id="key-storage-ideas" className="font-semibold mb-2">
              Places to store your key:
            </h3>
          </FtlMsg>
          <ul aria-labelledby="key-storage-ideas" className="flex flex-wrap">
            <FolderIconListItem listItemClassnames="mobileLandscape:basis-1/2">
              <FtlMsg id="flow-recovery-key-download-storage-ideas-folder-v2">
                Folder on secure device
              </FtlMsg>
            </FolderIconListItem>
            <GlobeIconListItem listItemClassnames="mobileLandscape:basis-1/2">
              <FtlMsg id="flow-recovery-key-download-storage-ideas-cloud">
                Trusted cloud storage
              </FtlMsg>
            </GlobeIconListItem>
            <PrinterIconListItem listItemClassnames="mobileLandscape:basis-1/2">
              <FtlMsg id="flow-recovery-key-download-storage-ideas-print-v2">
                Printed physical copy
              </FtlMsg>
            </PrinterIconListItem>
            <LockIconListItem listItemClassnames="mobileLandscape:basis-1/2">
              <FtlMsg id="flow-recovery-key-download-storage-ideas-pwd-manager">
                Password manager
              </FtlMsg>
            </LockIconListItem>
          </ul>
        </div>

        <Suspense fallback={spinner}>
          <ButtonDownloadRecoveryKeyPDF
            {...{ navigateForward, recoveryKeyValue, viewName }}
          />
        </Suspense>

        <FtlMsg id="flow-recovery-key-download-next-link-v2">
          <Link
            to=""
            className="text-sm link-blue text-center py-2 mx-auto"
            onClick={() => {
              logViewEvent(`flow.${viewName}`, 'recovery-key.skip-download');
              navigateForward();
            }}
          >
            Continue without downloading
          </Link>
        </FtlMsg>
      </div>
    </FlowContainer>
  );
};

export default FlowRecoveryKeyDownload;
