/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, {
  KeyboardEvent,
  FocusEvent,
  ChangeEvent,
  useState,
  useCallback,
  useEffect,
  ReactElement,
} from 'react';
import { v4 as uuidv4 } from 'uuid';

export type TextInputProps = {
  defaultValue?: string | number;
  disabled?: boolean;
  children?: ReactElement;
  id?: string;
  label: string;
  placeholder?: string;
  readerText?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'url' | 'password';
};

export const TextInput = ({
  defaultValue,
  disabled,
  children,
  id,
  label,
  placeholder,
  onChange,
  readerText,
  type = 'text',
}: TextInputProps) => {
  const [focussed, setFocussed] = useState<boolean>(false);
  const [hasContent, setHasContent] = useState<boolean>(defaultValue != null);
  const [inputId, setInputId] = useState<string | undefined>(id);
  const readerId = `${inputId}-sr`;

  useEffect(() => {
    !inputId && setInputId(uuidv4());
  }, [inputId, id]);

  const onFocus = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setFocussed(true);
    },
    [focussed]
  );

  const onBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setFocussed(false);
    },
    [focussed]
  );

  const textFieldChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setHasContent(event.target.value.length > 0);
      onChange && onChange(event);
    },
    [hasContent]
  );

  return (
    <div
      className={`flex items-center rounded transition-all duration-100 ease-in-out border ${
        focussed ? 'border-blue-400 shadow-input-blue-focus' : 'border-grey-200'
      } ${disabled ? 'border-grey-100 bg-grey-10' : 'bg-white'}`}
      data-testid="input-container"
    >
      <div className="relative flex-auto">
        <label
          htmlFor={inputId}
          className={`px-3 w-full cursor-text absolute text-sm origin-top-left transition-all duration-100 ease-in-out truncate font-body ${
            hasContent || focussed
              ? 'transform scale-80 mt-1 ml-1 -left-px'
              : 'mt-3 pt-px'
          } ${disabled ? 'text-grey-300' : 'text-grey-600'}`}
          data-testid="input-label"
        >
          {label}
        </label>
        <input
          className="pb-1 pt-5 px-3 w-full font-body text-sm rounded focus:outline-none disabled:bg-grey-10 placeholder-transparent focus:placeholder-grey-500 text-grey-600 disabled:text-grey-300 disabled:cursor-default"
          id={inputId}
          aria-describedby={readerText ? readerId : undefined}
          data-testid="input-field"
          onChange={textFieldChange}
          {...{
            defaultValue,
            disabled,
            onFocus,
            onBlur,
            placeholder,
            type,
          }}
        />
      </div>
      {readerText && (
        <span data-testid="input-srtext" className="sr-only" id={readerId}>
          {readerText}
        </span>
      )}
      {children}
    </div>
  );
};

export default TextInput;
