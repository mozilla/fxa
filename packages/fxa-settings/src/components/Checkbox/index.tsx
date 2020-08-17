/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { MouseEvent, useState, useCallback, ChangeEvent } from 'react';
import { ReactComponent as Checkmark } from './checkmark.svg';

export type CheckboxProps = {
  defaultChecked?: boolean;
  disabled?: boolean;
  label?: string;
  onClick?: (event: MouseEvent<HTMLInputElement>) => void;
};

export const Checkbox = ({
  defaultChecked,
  disabled,
  label,
}: CheckboxProps) => {
  const [focussed, setFocussed] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(defaultChecked === true);
  const [hovered, setHovered] = useState<boolean>(false);

  const checkboxFocus = useCallback(() => {
    setFocussed(true);
  }, [focussed]);

  const checkboxBlur = useCallback(() => {
    setFocussed(false);
  }, [focussed]);

  const checkboxChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setChecked(event.target.checked);
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
          onFocus={checkboxFocus}
          onBlur={checkboxBlur}
          onChange={checkboxChange}
          data-testid="checkbox-input"
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
    </label>
  );
};

export default Checkbox;
