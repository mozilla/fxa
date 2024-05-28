/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useRef, useState } from 'react';
import TotpInputGroup from '../TotpInputGroup';
import { FtlMsg } from 'fxa-react/lib/utils';
import classNames from 'classnames';

export type CodeArray = Array<string | undefined>;

export type FormVerifyTotpProps = {
  codeLength: 6 | 8;
  errorMessage: string;
  localizedInputGroupLabel: string;
  localizedSubmitButtonText: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  verifyCode: (code: string) => void;
};

const FormVerifyTotp = ({
  codeLength,
  errorMessage,
  localizedInputGroupLabel,
  localizedSubmitButtonText,
  setErrorMessage,
  verifyCode,
}: FormVerifyTotpProps) => {
  const inputRefs = useRef(
    Array.from({ length: codeLength }, () =>
      React.createRef<HTMLInputElement>()
    )
  );

  const [codeArray, setCodeArray] = useState<CodeArray>(
    new Array(codeLength).fill(undefined)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stringifiedCode = codeArray.join('');
  const isFormValid = stringifiedCode.length === codeLength && !errorMessage;
  const isSubmitDisabled = isSubmitting || !isFormValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitDisabled) {
      setIsSubmitting(true);
      await verifyCode(stringifiedCode);
      setIsSubmitting(false);
    }
  };

  return (
    <form
      noValidate
      className="flex flex-col gap-4 my-6"
      onSubmit={handleSubmit}
    >
      <TotpInputGroup
        {...{
          codeArray,
          codeLength,
          inputRefs,
          localizedInputGroupLabel,
          setCodeArray,
          setErrorMessage,
          errorMessage,
        }}
      />
      <FtlMsg
        id="form-verify-code-submit-button"
        attrs={{ ariaLabel: true }}
        vars={{ codeValue: stringifiedCode }}
      >
        <button
          type="submit"
          className={classNames(
            'cta-primary cta-xl',
            isSubmitDisabled &&
              'bg-blue-500/40 border-transparent text-white/50 cursor-not-allowed'
          )}
          // aria-disabled attribute is used instead of disabled
          // to ensure the button can be focused and announced to screen-readers
          aria-disabled={isSubmitDisabled}
        >
          {localizedSubmitButtonText}
        </button>
      </FtlMsg>
    </form>
  );
};

export default FormVerifyTotp;
