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
import { act } from '@testing-library/react';

export type InputTextProps = {
  defaultValue?: string | number;
  disabled?: boolean;
  children?: ReactElement;
  label: string;
  placeholder?: string;
  hasErrors?: boolean;
  errorText?: string;
  className?: string;
  inputOnlyClassName?: string;
  inputRef?: Ref<HTMLInputElement>;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocusCb?: () => void;
  onBlurCb?: () => void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'url' | 'password';
  name?: string;
  prefixDataTestId?: string;
  autoFocus?: boolean;
  maxLength?: number;
  pattern?: string;
  anchorPosition?: 'start' | 'middle' | 'end';
  spellCheck?: boolean;
  // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofilling-form-controls:-the-autocomplete-attribute
  autoComplete?:
    | 'off'
    | 'username'
    | 'current-password'
    | 'new-password'
    | 'one-time-code';
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
  required?: boolean;
  tooltipPosition?: 'top' | 'bottom';
  isPasswordInput?: boolean;
};

export const InputText = ({
  defaultValue,
  disabled,
  children,
  label,
  placeholder,
  onChange,
  onFocusCb,
  onBlurCb,
  hasErrors,
  errorText,
  className = '',
  inputOnlyClassName = '',
  inputRef,
  type = 'text',
  name,
  prefixDataTestId = '',
  autoFocus,
  maxLength,
  pattern,
  anchorPosition,
  spellCheck,
  autoComplete,
  inputMode,
  required,
  tooltipPosition,
  isPasswordInput = false,
}: InputTextProps) => {
  const [focused, setFocused] = useState<boolean>(false);
  const [hasContent, setHasContent] = useState<boolean>(defaultValue != null);

  const onFocus = useCallback(() => {
    setFocused(true);
    if (onFocusCb) {
      onFocusCb();
    }
  }, [onFocusCb]);

  const checkHasContent = (event: ChangeEvent<HTMLInputElement>) =>
    //setHasContent(event.target.value.length > 0);
    act(() => {
      setHasContent(event.target.value.length > 0);
    });

  const onBlur = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      checkHasContent(event);
      act(() => {
        setFocused(false);
      });
      if (onBlurCb) {
        onBlurCb();
      }
    },
    [onBlurCb]
  );

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
      className={classNames(
        'flex text-start rounded transition-all duration-100 ease-in-out border relative outline-none',
        hasErrors || errorText ? 'border-red-700 shadow-input-red-focus' : '',
        !hasErrors && focused
          ? 'border-blue-400 shadow-input-blue-focus'
          : 'border-grey-200',
        disabled ? 'border-grey-100 bg-grey-10' : 'bg-white',
        className
      )}
      data-testid={formatDataTestId('input-container')}
    >
      <span className="block flex-auto">
        <span
          className={classNames(
            'px-3 w-full cursor-text absolute ltr:origin-top-left rtl:origin-top-right text-sm transition-all duration-100 ease-in-out truncate font-body',
            disabled ? 'text-grey-300' : 'text-grey-900',
            placeholder || hasContent || focused
              ? 'transform scale-80 mt-1 ltr:ml-1 rtl:mr-1 ltr:-left-px rtl:-right-px'
              : 'mt-3 pt-px'
          )}
          data-testid={formatDataTestId('input-label')}
        >
          {label}
        </span>
        <input
          className={classNames(
            inputOnlyClassName,
            'pb-1 pt-5 px-3 font-body rounded text-start',
            // password specific width is to accomodate password manager icons
            // that are otherwise hidden and inaccessible under the visibility icon
            isPasswordInput ? 'w-[90%]' : 'w-full',
            focused ? 'outline-none border-none placeholder-grey-500' : '',
            disabled ? 'bg-grey-10 placeholder-transparent cursor-default' : ''
          )}
          data-testid={formatDataTestId('input-field')}
          onChange={textFieldChange}
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
            spellCheck,
            autoComplete,
            inputMode,
            required,
          }}
        />
      </span>
      {errorText && (
        <Tooltip
          type="error"
          anchorPosition={anchorPosition || 'start'}
          position={tooltipPosition}
          className="-mb-px"
          message={errorText}
        />
      )}
      {children}
    </label>
  );
};

export default InputText;
