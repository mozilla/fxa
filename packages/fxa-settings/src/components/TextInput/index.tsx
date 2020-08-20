/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, {
  ChangeEvent,
  useState,
  useCallback,
  ReactElement,
  RefObject,
} from 'react';

export type TextInputProps = {
  defaultValue?: string | number;
  disabled?: boolean;
  children?: ReactElement;
  label: string;
  placeholder?: string;
  errorText?: string;
  errorTooltipClass?: string;
  inputRef?: RefObject<HTMLInputElement>;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'url' | 'password';
};

export const TextInput = ({
  defaultValue,
  disabled,
  children,
  label,
  placeholder,
  onChange,
  errorText,
  errorTooltipClass,
  inputRef,
  type = 'text',
}: TextInputProps) => {
  const [focussed, setFocussed] = useState<boolean>(false);
  const [hasContent, setHasContent] = useState<boolean>(defaultValue != null);

  const onFocus = useCallback(() => {
    setFocussed(true);
  }, []);

  const onBlur = useCallback(() => {
    setFocussed(false);
  }, []);

  const textFieldChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setHasContent(event.target.value.length > 0);
      onChange && onChange(event);
    },
    [onChange]
  );

  return (
    <label
      className={`flex items-center rounded transition-all duration-100 ease-in-out border mt-3 mb-3 tooltip
      ${errorText ? 'tooltip-showing' : ''}
      ${
        focussed ? 'border-blue-400 shadow-input-blue-focus' : 'border-grey-200'
      }
      ${disabled ? 'border-grey-100 bg-grey-10' : 'bg-white'}`}
      data-testid="input-container"
    >
      <span className="block relative flex-auto">
        <span
          className={`px-3 w-full cursor-text absolute text-sm origin-top-left transition-all duration-100 ease-in-out truncate font-body ${
            hasContent || focussed
              ? 'transform scale-80 mt-1 ml-1 -left-px'
              : 'mt-3 pt-px'
          } ${disabled ? 'text-grey-300' : 'text-grey-600'}`}
          data-testid="input-label"
        >
          {label}
        </span>
        <input
          className="pb-1 pt-5 px-3 w-full font-body text-sm rounded focus:outline-none disabled:bg-grey-10 placeholder-transparent focus:placeholder-grey-500 text-grey-600 disabled:text-grey-300 disabled:cursor-default"
          data-testid="input-field"
          onChange={textFieldChange}
          ref={inputRef}
          {...{
            defaultValue,
            disabled,
            onFocus,
            onBlur,
            placeholder,
            type,
          }}
        />
      </span>

      {errorText && (
        <span
          data-testid="error-tooltip"
          className={
            errorTooltipClass
              ? errorTooltipClass
              : 'tooltip-text tooltip-showing bg-red-200 p-3 -mt-20 rounded text-sm'
          }
        >
          {errorText}
        </span>
      )}
      {children}
    </label>
  );
};

export default TextInput;
