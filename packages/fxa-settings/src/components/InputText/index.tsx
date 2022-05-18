/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, {
  ChangeEvent,
  useState,
  useCallback,
  ReactElement,
  Ref,
} from 'react';
import classNames from 'classnames';
import { Tooltip } from '../Tooltip';

export type InputTextProps = {
  defaultValue?: string | number;
  disabled?: boolean;
  children?: ReactElement;
  label: string;
  placeholder?: string;
  errorText?: string;
  className?: string;
  inputRef?: Ref<HTMLInputElement>;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocusCb?: () => void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'url' | 'password';
  name?: string;
  prefixDataTestId?: string;
  autoFocus?: boolean;
  maxLength?: number;
  pattern?: string;
};

export const InputText = ({
  defaultValue,
  disabled,
  children,
  label,
  placeholder,
  onChange,
  onFocusCb,
  errorText,
  className = '',
  inputRef,
  type = 'text',
  name,
  prefixDataTestId = '',
  autoFocus,
  maxLength,
  pattern,
}: InputTextProps) => {
  const [focussed, setFocussed] = useState<boolean>(false);
  const [hasContent, setHasContent] = useState<boolean>(defaultValue != null);

  const onFocus = useCallback(() => {
    setFocussed(true);
    if (onFocusCb) {
      onFocusCb();
    }
  }, [onFocusCb]);

  const checkHasContent = (event: ChangeEvent<HTMLInputElement>) =>
    setHasContent(event.target.value.length > 0);

  const onBlur = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    checkHasContent(event);
    setFocussed(false);
  }, []);

  const textFieldChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      checkHasContent(event);
      onChange && onChange(event);
    },
    [onChange]
  );

  function formatDataTestId(id: string) {
    return prefixDataTestId ? `${prefixDataTestId}-${id}` : id;
  }

  return (
    <label
      className={`flex items-center rounded transition-all duration-100 ease-in-out border relative
      ${
        focussed ? 'border-blue-400 shadow-input-blue-focus' : 'border-grey-200'
      }
      ${disabled ? 'border-grey-100 bg-grey-10' : 'bg-white'} ${className}`}
      data-testid={formatDataTestId('input-container')}
    >
      <span className="block flex-auto">
        <span
          className={classNames(
            'px-3 w-full cursor-text absolute text-sm origin-top-left transition-all duration-100 ease-in-out truncate font-body',
            disabled ? 'text-grey-300' : 'text-grey-600',
            hasContent || focussed
              ? 'transform scale-80 mt-1 ml-1 -left-px'
              : 'mt-3 pt-px'
          )}
          data-testid={formatDataTestId('input-label')}
        >
          {label}
        </span>
        <input
          className="pb-1 pt-5 px-3 w-full font-body rounded focus:outline-none disabled:bg-grey-10 placeholder-transparent focus:placeholder-grey-500 text-grey-600 disabled:text-grey-300 disabled:cursor-default"
          data-testid={formatDataTestId('input-field')}
          onChange={textFieldChange}
          title={label}
          ref={inputRef}
          {...{
            name,
            defaultValue,
            disabled,
            onFocus,
            onBlur,
            placeholder,
            type,
            autoFocus,
            maxLength,
            pattern,
          }}
        />
      </span>
      {errorText && (
        <Tooltip type="error" className="-mb-px" message={errorText} />
      )}
      {children}
    </label>
  );
};

export default InputText;
