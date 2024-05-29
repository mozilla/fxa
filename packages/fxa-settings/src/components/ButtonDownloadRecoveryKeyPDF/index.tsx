/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useAccount, useAlertBar, useFtlMsgResolver } from '../../models';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { RecoveryKeyPDF } from '../ButtonDownloadRecoveryKeyPDF/RecoveryKeyPDF';
import {
  FtlMsg,
  LocalizedDateOptions,
  getLocalizedDate,
} from 'fxa-react/lib/utils';
import { logViewEvent } from '../../lib/metrics';
import { FontData, getRequiredFont } from './requiredFont';
import { determineLocale } from '@fxa/shared/l10n';

export interface LocalizedRecoveryKeyPdfContent {
  heading: string;
  dateGenerated: string;
  keyLegend: string;
  instructions: string;
  storageHeading: string;
  storageIdeaFolder: string;
  storageIdeaCloud: string;
  storageIdeaPrint: string;
  storageIdeaPwdManager: string;
  findOutMoreHeading: string;
}

interface ButtonDownloadRecoveryKeyPDFProps {
  navigateForward?: () => void;
  recoveryKeyValue: string;
  viewName: string;
}

export const getFilename = (email: string) => {
  const date = new Date().toISOString().split('T')[0];
  const prefix = 'Mozilla-Recovery-Key';
  // Windows has a max directory length of 260 characters (including path)
  // filename should be kept much shorter (maxLength is arbitrary).
  let filename = `${prefix}_${date}_${email}`.substring(0, 71) + `.pdf`;

  return filename;
};

export const ButtonDownloadRecoveryKeyPDF = ({
  navigateForward,
  recoveryKeyValue,
  viewName,
}: ButtonDownloadRecoveryKeyPDFProps) => {
  const account = useAccount();
  const email = account.primaryEmail.email;
  const keyCreated = Date.now();
  const currentLanguage = determineLocale(
    window.navigator.languages.join(', ')
  );
  const ftlMsgResolver = useFtlMsgResolver();

  const alertBar = useAlertBar();

  const keyDateFallback = Intl.DateTimeFormat('default', {
    dateStyle: 'medium',
  }).format(new Date(keyCreated));

  const keyDateFluent = getLocalizedDate(
    keyCreated,
    LocalizedDateOptions.MediumDateStyle
  );

  const localizedText: LocalizedRecoveryKeyPdfContent = {
    heading: ftlMsgResolver.getMsg(
      'recovery-key-pdf-heading',
      'Account Recovery Key'
    ),
    dateGenerated: ftlMsgResolver.getMsg(
      'recovery-key-pdf-download-date',
      `Generated: ${keyDateFallback}`,
      { date: keyDateFluent }
    ),
    keyLegend: ftlMsgResolver.getMsg(
      'recovery-key-pdf-key-legend',
      'Account Recovery Key'
    ),
    instructions: ftlMsgResolver.getMsg(
      'recovery-key-pdf-instructions',
      'This key allows you to recover your encrypted browser data (including passwords, bookmarks, and history) if you forget your password. Store it in a place you’ll remember. '
    ),
    storageHeading: ftlMsgResolver.getMsg(
      'recovery-key-pdf-storage-ideas-heading',
      'Places to store your key'
    ),
    storageIdeaFolder: ftlMsgResolver.getMsg(
      'flow-recovery-key-download-storage-ideas-folder-v2',
      'Folder on secure device'
    ),
    storageIdeaCloud: ftlMsgResolver.getMsg(
      'flow-recovery-key-download-storage-ideas-cloud',
      'Trusted cloud storage'
    ),
    storageIdeaPrint: ftlMsgResolver.getMsg(
      'flow-recovery-key-download-storage-ideas-print-v2',
      'Printed physical copy'
    ),
    storageIdeaPwdManager: ftlMsgResolver.getMsg(
      'flow-recovery-key-download-storage-ideas-pwd-manager',
      'Password manager'
    ),
    findOutMoreHeading: ftlMsgResolver.getMsg(
      'recovery-key-pdf-support',
      'Learn more about your account recovery key'
    ),
  };

  const requiredFont: FontData = getRequiredFont(currentLanguage);

  // File download test coverage is provided by Playwright functional test
  const downloadFile = async () => {
    const doc = (
      <RecoveryKeyPDF
        {...{ recoveryKeyValue, requiredFont, email, localizedText }}
      />
    );

    try {
      const asPdf = pdf();
      asPdf.updateContainer(doc);
      const blob = await asPdf.toBlob();
      const filename = getFilename(account.primaryEmail.email);
      saveAs(blob, filename);
      logViewEvent(`flow.${viewName}`, `recovery-key.download-success`);
    } catch (e) {
      logViewEvent(`flow.${viewName}`, `recovery-key.download-failed`);
      alertBar.error(
        ftlMsgResolver.getMsg(
          'recovery-key-pdf-download-error',
          'Sorry, there was a problem downloading your account recovery key.'
        )
      );
    }
  };

  return (
    <>
      <FtlMsg id="recovery-key-download-button-v3">
        <button
          className="cta-primary cta-xl w-full"
          onClick={async () => {
            logViewEvent(`flow.${viewName}`, `recovery-key.download-option`);
            await downloadFile();
            navigateForward && navigateForward();
          }}
        >
          Download and continue
        </button>
      </FtlMsg>
    </>
  );
};

export default ButtonDownloadRecoveryKeyPDF;
