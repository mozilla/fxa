/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import classNames from 'classnames';
import { CodeArray } from '../FormVerifyTotp';
import { useFtlMsgResolver } from '../../models';

export type TotpInputGroupProps = {
  codeArray: CodeArray;
  codeLength: 6 | 8;
  inputRefs: React.MutableRefObject<React.RefObject<HTMLInputElement>[]>;
  localizedInputGroupLabel: string;
  setCodeArray: React.Dispatch<React.SetStateAction<CodeArray>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  errorMessage?: string;
};

type SingleInputProps = {
  index: number;
};

const NUMBERS_ONLY_REGEX = /^[0-9]+$/;

export const TotpInputGroup = ({
  codeArray,
  codeLength,
  inputRefs,
  localizedInputGroupLabel,
  setCodeArray,
  setErrorMessage,
  errorMessage = '',
}: TotpInputGroupProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const focusOnNextInput = (index: number) => {
    inputRefs.current[index + 1].current?.focus();
  };

  const focusOnPreviousInput = (index: number) => {
    inputRefs.current[index - 1].current?.focus();
  };

  const focusOnSpecifiedInput = (index: number) => {
    inputRefs.current[index].current?.focus();
  };

  const handleBackspace = async (index: number) => {
    errorMessage && setErrorMessage('');
    const currentCodeArray = [...codeArray];
    currentCodeArray[index] = undefined;
    await setCodeArray(currentCodeArray);
    if (index > 0) {
      focusOnPreviousInput(index);
    } else {
      focusOnSpecifiedInput(index);
    }
  };

  const handleDelete = async (index: number) => {
    errorMessage && setErrorMessage('');
    const currentCodeArray = [...codeArray];
    if (currentCodeArray[index] !== undefined) {
      currentCodeArray[index] = undefined;
    } else {
      currentCodeArray[index + 1] = undefined;
    }
    await setCodeArray(currentCodeArray);
    if (index < codeLength - 1) {
      focusOnNextInput(index);
    } else {
      focusOnSpecifiedInput(index);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    switch (e.key) {
      case 'Backspace':
        e.preventDefault();
        if (index > 0) {
          focusOnPreviousInput(index);
        }
        handleBackspace(index);
        break;
      case 'Delete':
        e.preventDefault();
        if (index < codeLength) {
          handleDelete(index);
        }
        break;
      case 'ArrowRight':
        if (index < codeLength - 1) {
          focusOnNextInput(index);
        }
        break;
      case 'ArrowLeft':
        if (index > 0) {
          focusOnPreviousInput(index);
        }
        break;
      default:
        break;
    }
  };

  const handleInput = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    e.preventDefault();
    errorMessage && setErrorMessage('');
    const currentCodeArray = [...codeArray];

    const inputValue = e.target.value;
    // we only want to check new value
    const newInputValue = Array.from(inputValue).filter((character) => {
      return character !== codeArray[index];
    });

    if (newInputValue.length === 1) {
      // if the new value is a number, use it
      if (newInputValue[0].match(NUMBERS_ONLY_REGEX)) {
        currentCodeArray[index] = newInputValue[0];
        await setCodeArray(currentCodeArray);
      } else {
        // if the new value is not a number, keep the previous value (if it exists) or clear the input box
        currentCodeArray[index] = codeArray[index];
        await setCodeArray(currentCodeArray);
      }
    }

    if (currentCodeArray[index] !== undefined && index < codeLength - 1) {
      focusOnNextInput(index);
    } else {
      focusOnSpecifiedInput(index);
    }
  };

  const handlePaste = async (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number
  ) => {
    errorMessage && setErrorMessage('');
    let currentIndex = index;
    const currentCodeArray = [...codeArray];
    const clipboardText = e.clipboardData.getData('text');
    let digitsOnlyArray = clipboardText
      .split('')
      .filter((character) => {
        return character.match(NUMBERS_ONLY_REGEX);
      })
      .slice(0, codeLength - index);
    digitsOnlyArray.forEach((character: string) => {
      currentCodeArray[currentIndex] = character;
      if (currentIndex < codeLength - 1) {
        focusOnNextInput(index);
        currentIndex++;
      }
    });

    await setCodeArray(currentCodeArray);
    // if last pasted character is on last input, focus on that input
    // otherwise focus on next input after last pasted character
    focusOnSpecifiedInput(currentIndex);
  };

  const SingleDigitInput = ({ index }: SingleInputProps) => {
    const [isFocused, setIsFocused] = useState(false);

    // number used for localized message starts at 1
    const inputNumber = index + 1;
    const localizedLabel = ftlMsgResolver.getMsg(
      'single-char-input-label',
      `Digit ${inputNumber} of ${codeLength}`,
      { inputNumber, codeLength }
    );
    return (
      <span
        key={`code-box-${index}`}
        className={classNames('flex-1 min-h-14 rounded outline-none border', {
          'min-w-12': codeLength === 6,
          'min-w-8': codeLength === 8,
          'border-grey-200 ': !errorMessage && !isFocused,
          'border-blue-400 shadow-input-blue-focus': !errorMessage && isFocused,
          'border-red-700': errorMessage,
          'shadow-input-red-focus': errorMessage && isFocused,
        })}
      >
        <label className="sr-only" htmlFor={`code-input-${index}`}>
          {localizedLabel}
        </label>
        <input
          id={`code-input-${index}`}
          value={codeArray[index]}
          ref={inputRefs.current[index]}
          type="text"
          autoComplete="one-time-code"
          inputMode="numeric"
          size={1}
          pattern="[0-9]{1}"
          className="text-xl text-center font-mono h-full w-full rounded outline-none border-none"
          onBlur={() => setIsFocused(false)}
          onClick={(e: React.MouseEvent<HTMLInputElement>) => {
            e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);
          }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleInput(e, index);
          }}
          onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            handleKeyDown(e, index);
          }}
          onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
            e.preventDefault();
            handlePaste(e, index);
          }}
        />
      </span>
    );
  };

  const getAllSingleDigitInputs = () => {
    return [...Array(codeLength)].map((value: undefined, index: number) => {
      return (
        <SingleDigitInput {...{ index }} key={`single-digit-input-${index}`} />
      );
    });
  };

  return (
    <fieldset>
      <legend id="totp-input-group-label" className="text-start text-sm">
        {localizedInputGroupLabel}
      </legend>
      <div
        className={classNames(
          // OTP code input must be displayed LTR for both LTR and RTL languages
          'flex my-2 rtl:flex-row-reverse',
          codeLength === 6 && 'gap-2 mobileLandscape:gap-4',
          codeLength === 8 && 'gap-1 mobileLandscape:gap-2'
        )}
        aria-describedby="totp-input-group-label totp-input-group-error"
      >
        {getAllSingleDigitInputs()}
      </div>
    </fieldset>
  );
};

export default TotpInputGroup;
