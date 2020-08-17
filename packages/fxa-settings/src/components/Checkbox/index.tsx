/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, {
  FocusEvent,
  MouseEvent,
  useEffect,
  useState,
  useCallback,
  ChangeEvent,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ReactComponent as Checkmark } from './checkmark.svg';

export type CheckboxProps = {
  defaultChecked?: boolean;
  disabled?: boolean;
  id?: string;
  label?: string;
  onClick?: (event: MouseEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  readerText?: string;
};

export const Checkbox = ({
  defaultChecked,
  disabled,
  id,
  label,
  onClick,
  onBlur,
  onFocus,
  onChange,
  readerText,
}: CheckboxProps) => {
  const [focussed, setFocussed] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(defaultChecked === true);
  const [hovered, setHovered] = useState<boolean>(false);
  const [checkboxId, setCheckboxId] = useState<string | undefined>(id);
  const readerId = `${checkboxId}-sr`;

  useEffect(() => {
    !checkboxId && setCheckboxId(uuidv4());
  }, [checkboxId, id]);

  const checkboxFocus = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setFocussed(true);
      onFocus && onFocus(event);
    },
    [focussed]
  );

  const checkboxBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setFocussed(false);
      onBlur && onBlur(event);
    },
    [focussed]
  );

  const checkboxChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setChecked(event.target.checked);
      onChange && onChange(event);
    },
    [checked]
  );

  return (
    <label
      className="flex items-start"
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
      data-testid="checkbox-container"
    >
      <span className="relative">
        <input
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          type="checkbox"
          id={checkboxId}
          aria-describedby={readerText ? readerId : undefined}
          onFocus={checkboxFocus}
          onBlur={checkboxBlur}
          onChange={checkboxChange}
          data-testid="checkbox-input"
          {...{
            defaultChecked,
            disabled,
            onClick,
          }}
        />
        <span
          className={`block border-2 rounded w-5 h-5 transition-all duration-100 ease-in-out relative ${
            disabled
              ? 'border-grey-300 text-grey-300'
              : `cursor-pointer ${
                  checked
                    ? `border-blue-500 text-blue-500 ${
                        focussed ? 'shadow-input-blue-focus' : ''
                      }`
                    : `border-grey-400 text-grey-400 ${
                        focussed ? 'shadow-input-grey-focus' : ''
                      }`
                }`
          }`}
        >
          <Checkmark
            width="12"
            height="12"
            className={`transition-all duration-75 ease-in-out fill-current absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 ${
              // Only show the preview checkmark on hover if not disabled and not already checked
              checked
                ? ''
                : hovered && !disabled
                ? 'opacity-50 scale-75'
                : 'opacity-0'
            }`}
          />
        </span>
      </span>
      {label && (
        <span data-testid="checkbox-label" className="text-sm ml-3 font-body">
          {label}
        </span>
      )}
      {readerText && (
        <span data-testid="checkbox-srtext" className="sr-only" id={readerId}>
          {readerText}
        </span>
      )}
    </label>
  );
};

export default Checkbox;
