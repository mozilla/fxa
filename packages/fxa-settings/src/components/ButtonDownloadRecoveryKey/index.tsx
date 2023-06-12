/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { useAccount, useFtlMsgResolver } from '../../models';
import { FtlMsg } from 'fxa-react/lib/utils';
import { logViewEvent } from '../../lib/metrics';
import { searchParams } from '../../lib/utilities';

export enum fileContentVariation {
  'keyOnly',
  'withBOM',
  'withCharSet',
  'withTextEncoder',
}

interface ButtonDownloadRecoveryKeyProps {
  navigateForward?: () => void;
  recoveryKeyValue: string;
  viewName: string;
  // Temporary addition for storybook testing
  fileType?: fileContentVariation;
}

export const ButtonDownloadRecoveryKey = ({
  navigateForward,
  recoveryKeyValue,
  viewName,
  fileType = fileContentVariation['keyOnly'],
}: ButtonDownloadRecoveryKeyProps) => {
  const { primaryEmail } = useAccount();
  const currentDate = new Date();
  const downloadDateInLocale = currentDate.toLocaleDateString(
    navigator.language
  );
  const ftlMsgResolver = useFtlMsgResolver();
  const [contentType, setContentType] = useState(
    fileContentVariation['keyOnly']
  );

  // Optional `downloadOption` search param can be used to test
  // character encoding options. Related to FXA-7572
  // By default, the downloaded file will only contain the recovery key
  // unless one of the following params is added to the URL.

  // The file type can also be defined by passing in a `fileType` prop
  // - this is used for storybook.
  const params = searchParams(window.location.search);

  useEffect(() => {
    if (
      fileType === fileContentVariation['withBOM'] ||
      params.fileContentType === 'withBOM'
    ) {
      setContentType(fileContentVariation['withBOM']);
    } else if (
      fileType === fileContentVariation['withCharSet'] ||
      params.fileContentType === 'withCharSet'
    ) {
      setContentType(fileContentVariation['withCharSet']);
    } else if (
      fileType === fileContentVariation['withTextEncoder'] ||
      params.fileContentType === 'withTextEncoder'
    ) {
      setContentType(fileContentVariation['withTextEncoder']);
    }
  }, [fileType, params, setContentType]);

  // Localized strings for detailed file (currently disabled unless `downloadOption` param is added to URL)
  const fileHeading = ftlMsgResolver.getMsg(
    'recovery-key-file-header',
    'SAVE YOUR ACCOUNT RECOVERY KEY'
  );

  const fileInstructions = ftlMsgResolver.getMsg(
    'recovery-key-file-instructions',
    'Store this file containing your account recovery key in a place you’ll remember. Or print it and keep a physical copy. Your account recovery key can help you recover Firefox data if you forget your password.'
  );

  const fileKey = ftlMsgResolver.getMsg(
    'recovery-key-file-key-value-v3',
    `Key:`
  );

  const fileUserEmail = ftlMsgResolver.getMsg(
    'recovery-key-file-user-email-v2',
    `* Firefox account: ${primaryEmail.email}`,
    { email: primaryEmail.email }
  );

  const fileDate = ftlMsgResolver.getMsg(
    'recovery-key-file-download-date-v2',
    `* Key generated: ${downloadDateInLocale}`,
    { downloadDate: downloadDateInLocale }
  );

  const supportURL = 'https://mzl.la/3bNrM1I';

  const fileSupport = ftlMsgResolver.getMsg(
    'recovery-key-file-support-v2',
    `* Learn more about your account recovery key: ${supportURL}`,
    { supportURL }
  );

  // Localized content in the download file is currently *disabled* by default due to an issue with encoding recognition on Android.
  // Non-latin text (e.g., Hebrew) may be displayed as jibberish due to incorrect encoding detection.
  // In addition, localized strings contain important directionality markers that are hidden on Mac
  // but visible on many other devices. On Apple devices, these directionality markers get copied with the key,
  // and the key is rejected as invalid during password reset.

  // Adding BOM ahead of detailed file content could possibly force detection of UTF-8 encoding.
  // https://learn.microsoft.com/en-us/globalization/encoding/byte-order-mark
  // To test, add `downloadOption=withBOM` to the query params when entering the account recovery key creation flow and hit enter to reload
  const BOM = new Uint8Array([0xef, 0xbb, 0xbf]);

  const fileContentWithBOM = new Blob(
    [
      BOM,
      '*WITH BOM*',
      '\r\n\r\n',
      fileHeading,
      '\r\n\r\n',
      fileInstructions,
      '\r\n\r\n',
      fileKey,
      '\r\n\r\n',
      recoveryKeyValue,
      '\r\n\r\n',
      fileUserEmail,
      '\r\n',
      fileDate,
      '\r\n',
      fileSupport,
    ],
    {
      type: 'text/plain',
    }
  );

  // Specifying the char set of the blob might be sufficient
  // To test, add `downloadOption=withCharSet` to the query params when entering the account recovery key creation flow and hit enter to reload
  const fileContentWithCharSet = new Blob(
    [
      '*WITH CHARSET*',
      '\r\n\r\n',
      fileHeading,
      '\r\n\r\n',
      fileInstructions,
      '\r\n\r\n',
      fileKey,
      '\r\n\r\n',
      recoveryKeyValue,
      '\r\n\r\n',
      fileUserEmail,
      '\r\n',
      fileDate,
      '\r\n',
      fileSupport,
    ],
    {
      type: 'text/plain;charset=UTF-8',
    }
  );

  // Using TextEncoder generates a byte stream with UTF-8 encoding
  // To test, add `downloadOption=withTextEncoder` to the query params when entering the account recovery key creation flow and hit enter to reload
  let encoder = new TextEncoder();
  const fileContentWithTextEncoder = new Blob(
    [
      '*WITH TEXT ENCODER*',
      '\r\n\r\n',
      encoder.encode(fileHeading),
      '\r\n\r\n',
      encoder.encode(fileInstructions),
      '\r\n\r\n',
      encoder.encode(fileKey),
      '\r\n\r\n',
      encoder.encode(recoveryKeyValue),
      '\r\n\r\n',
      encoder.encode(fileUserEmail),
      '\r\n',
      encoder.encode(fileDate),
      '\r\n',
      encoder.encode(fileSupport),
    ],
    {
      type: 'text/plain',
    }
  );

  // Default file content
  // While investigation into encoding of localized text is ongoing,
  // we have reverted to a text file containing only the key.
  const fileContentWithKeyOnly = new Blob([recoveryKeyValue], {
    type: 'text/plain',
  });

  const getFilename = () => {
    const date = currentDate.toISOString().split('T')[0];
    // Windows has a max directory length of 260 characters (including path)
    // filename should be kept much shorter (maxLength is arbitrary).
    const maxLength = 75;
    const prefix = 'Firefox-Recovery-Key';
    let email = primaryEmail.email;
    let filename = `${prefix}_${date}_${email}.txt`;

    if (filename.length > maxLength) {
      const lengthWithoutEmail = filename.length - email.length;
      email = email.slice(0, maxLength - lengthWithoutEmail);
      filename = `${prefix}_${date}_${email}.txt`;
    }
    return filename;
  };

  // Get the URL for the selected file content
  const getURL = () => {
    let fileContent;
    switch (contentType) {
      case fileContentVariation['withBOM']: {
        fileContent = fileContentWithBOM;
        break;
      }
      case fileContentVariation['withCharSet']: {
        fileContent = fileContentWithCharSet;
        break;
      }
      case fileContentVariation['withTextEncoder']: {
        fileContent = fileContentWithTextEncoder;
        break;
      }
      default: {
        fileContent = fileContentWithKeyOnly;
        break;
      }
    }
    return URL.createObjectURL(fileContent);
  };

  return (
    <FtlMsg id="recovery-key-download-button-v3" attrs={{ title: true }}>
      <a
        title="Download and continue"
        href={getURL()}
        download={getFilename()}
        data-testid="recovery-key-download"
        className="cta-primary cta-xl w-full"
        onClick={() => {
          logViewEvent(`flow.${viewName}`, `recovery-key.download-option`);
          navigateForward && navigateForward();
        }}
      >
        Download and continue
      </a>
    </FtlMsg>
  );
};

export default ButtonDownloadRecoveryKey;
