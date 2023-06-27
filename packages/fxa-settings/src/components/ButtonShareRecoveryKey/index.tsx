/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useAccount, useFtlMsgResolver } from '../../models';
import ButtonDownloadRecoveryKey from '../ButtonDownloadRecoveryKey';

interface ButtonShareRecoveryKeyProps {
  navigateForward?: () => void;
  recoveryKeyValue: string;
  viewName: string;
}

export const ButtonShareRecoveryKey = ({
  navigateForward,
  recoveryKeyValue,
  viewName,
}: ButtonShareRecoveryKeyProps) => {
  const { primaryEmail } = useAccount();
  const currentDate = new Date();
  const downloadDateInLocale = currentDate.toLocaleDateString(
    navigator.language
  );
  const ftlMsgResolver = useFtlMsgResolver();
  const [nativeSharingEnabled, setNativeSharingEnabled] = useState<boolean>(
    !!navigator.share
  );

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

  // Adding BOM ahead of detailed file content could possibly force detection of UTF-8 encoding.
  // https://learn.microsoft.com/en-us/globalization/encoding/byte-order-mark
  // To test, add `downloadOption=withBOM` to the query params when entering the account recovery key creation flow and hit enter to reload
  const BOM = new Uint8Array([0xef, 0xbb, 0xbf]);

  const fileContent = new Blob(
    [
      BOM,
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

  const shareData = {
    files: [new File([fileContent], getFilename(), { type: fileContent.type })],
    text: 'Save this key in a secure location - it can help your recover your data if you forget your password.',
  };

  const shareKey = async () => {
    try {
      await navigator.share(shareData);
    } catch (err) {
      alert('Something went wrong, please try again');
    }
  };

  if (nativeSharingEnabled) {
    return (
      <button
        type="button"
        onClick={shareKey}
        className="cta-primary cta-xl w-full"
      >
        Save your account recovery key
      </button>
    );
  } else {
    return <ButtonDownloadRecoveryKey {...{ recoveryKeyValue, viewName }} />;
  }
};

export default ButtonShareRecoveryKey;
