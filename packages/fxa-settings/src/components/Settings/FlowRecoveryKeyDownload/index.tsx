/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import FlowContainer from '../FlowContainer';
import ProgressBar from '../ProgressBar';
import DataBlock from '../../DataBlock';
import {
  FolderIconListItem,
  GlobeIconListItem,
  LockIconListItem,
  PrinterIconListItem,
} from '../../IconListItem';
import ButtonDownloadRecoveryKey from '../../ButtonDownloadRecoveryKey';
import { Link } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { RecoveryKeyImage } from '../../images';
import { logViewEvent } from '../../../lib/metrics';

export type FlowRecoveryKeyDownloadProps = {
  localizedBackButtonTitle: string;
  localizedPageTitle: string;
  navigateBackward: () => void;
  navigateForward: () => void;
  recoveryKeyValue: string;
  viewName: string;
};

export const FlowRecoveryKeyDownload = ({
  localizedBackButtonTitle,
  localizedPageTitle,
  navigateBackward,
  navigateForward,
  recoveryKeyValue,
  viewName,
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

        <FtlMsg id="flow-recovery-key-download-heading">
          <h2 className="font-bold text-xl">
            {/* This is an em dash - add space? */}
            Account recovery key generated — store it in a place you’ll remember
          </h2>
        </FtlMsg>
        <FtlMsg id="flow-recovery-key-download-info">
          <p>
            This key will help recover your data if you forget your password.
          </p>
        </FtlMsg>
        <DataBlock
          value={recoveryKeyValue}
          onCopy={() =>
            logViewEvent(`flow.${viewName}`, `recovery-key.copy-option`)
          }
          isInline
        />
        <FtlMsg id="flow-recovery-key-download-storage-ideas-heading">
          <h3 id="key-storage-ideas" className="font-semibold -mb-4">
            Some ideas for storing your account recovery key:
          </h3>
        </FtlMsg>
        <ul aria-labelledby="key-storage-ideas">
          <FolderIconListItem>
            <FtlMsg id="flow-recovery-key-download-storage-ideas-folder">
              Memorable folder in your device
            </FtlMsg>
          </FolderIconListItem>
          <GlobeIconListItem>
            <FtlMsg id="flow-recovery-key-download-storage-ideas-cloud">
              Trusted cloud storage
            </FtlMsg>
          </GlobeIconListItem>
          <PrinterIconListItem>
            <FtlMsg id="flow-recovery-key-download-storage-ideas-print">
              Print and keep a physical copy
            </FtlMsg>
          </PrinterIconListItem>
          <LockIconListItem>
            <FtlMsg id="flow-recovery-key-download-storage-ideas-pwd-manager">
              <p>Password manager</p>
            </FtlMsg>
          </LockIconListItem>
        </ul>
        <ButtonDownloadRecoveryKey
          {...{ navigateForward, recoveryKeyValue, viewName }}
        />
        <FtlMsg id="flow-recovery-key-download-next-link">
          <Link
            to=""
            className="text-sm link-blue text-center py-2 mx-auto"
            onClick={() => {
              logViewEvent(`flow.${viewName}`, 'recovery-key.skip-download');
              navigateForward();
            }}
          >
            Next
          </Link>
        </FtlMsg>
      </div>
    </FlowContainer>
  );
};

export default FlowRecoveryKeyDownload;
