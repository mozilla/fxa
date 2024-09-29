/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ChangeEvent, useState, useCallback } from 'react';
import { ReactComponent as Checkmark } from './checkmark.svg';
import { act } from '@testing-library/react';

export type CheckboxProps = {
  defaultChecked?: boolean;
  disabled?: boolean;
  label?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  prefixDataTestId?: string;
};

export const Checkbox = ({
  defaultChecked,
  disabled,
  label,
  onChange,
  prefixDataTestId,
}: CheckboxProps) => {
  const [focused, setFocused] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(defaultChecked === true);
  const [hovered, setHovered] = useState<boolean>(false);

  const checkboxFocus = useCallback(() => {
    setFocused(true);
  }, [setFocused]);

  const checkboxBlur = useCallback(() => {
    act(() => {
      setFocused(false);
    });
  }, [setFocused]);

  const checkboxChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setChecked(event.target.checked);
      if (onChange) onChange(event);
    },
    [setChecked, onChange]
  );
  function formatDataTestId(id: string) {
    return prefixDataTestId ? `${prefixDataTestId}-${id}` : id;
  }

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
          onFocus={checkboxFocus}
          onBlur={checkboxBlur}
          onChange={checkboxChange}
          data-testid={formatDataTestId('checkbox-input')}
          {...{
            defaultChecked,
            disabled,
          }}
        />
        <span
          className={`block border-2 rounded w-5 h-5 transition-all duration-100 ease-in-out relative ${
            disabled
              ? 'border-grey-300 text-grey-300'
              : `cursor-pointer ${
                  checked
                    ? `border-blue-500 text-blue-500 ${
                        focused ? 'shadow-input-blue-focus' : ''
                      }`
                    : `border-grey-400 text-grey-400 ${
                        focused ? 'shadow-input-grey-focus' : ''
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
        <span
          data-testid={formatDataTestId('checkbox-label')}
          className="leading-tight ltr:ml-2 rtl:mr-2 font-body"
        >
          {label}
        </span>
      )}
    </label>
  );
};

export default Checkbox;
