/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useRef, useState } from 'react';
import AppLayout from '../AppLayout';
import TotpInputGroup, { TotpInputGroupProps } from '.';
import { CodeArray } from '../FormVerifyTotp';

export const Subject = ({
  codeLength = 6,
  initialErrorMessage = '',
}: Partial<TotpInputGroupProps> & { initialErrorMessage?: string }) => {
  const [codeArray, setCodeArray] = useState<CodeArray>([]);
  const [errorMessage, setErrorMessage] = useState(initialErrorMessage || '');
  const inputRefs = useRef(
    Array.from({ length: codeLength }, () =>
      React.createRef<HTMLInputElement>()
    )
  );

  return (
    <TotpInputGroup
      localizedInputGroupLabel={`Enter ${codeLength.toString()}-digit code`}
      {...{
        codeArray,
        codeLength,
        inputRefs,
        setCodeArray,
        errorMessage,
        setErrorMessage,
      }}
    />
  );
};

export default Subject;
