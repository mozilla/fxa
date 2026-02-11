/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ChangeEvent, useState, useCallback } from 'react';
import classNames from 'classnames';
import { ReactComponent as CheckWhite } from './icon-check-white.svg';

export type InputCheckboxBlueProps = {
  defaultChecked?: boolean;
  disabled?: boolean;
  label?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  prefixDataTestId?: string;
};

// This InputCheckboxBlue component is modeled on the most recently updated styles for non-authenticated flows
export const InputCheckboxBlue = ({
  defaultChecked,
  disabled,
  label,
  onChange,
  prefixDataTestId,
}: InputCheckboxBlueProps) => {
  const [checked, setChecked] = useState<boolean>(!!defaultChecked);

  const checkboxChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setChecked(event.target.checked);
      if (onChange) onChange(event);
    },
    [setChecked, onChange]
  );

  const checkboxBaseClassNames =
    'flex-shrink-0 appearance-none border w-4 h-4 transition-standard rounded-sm focus:outline-2 focus:outline-offset-2 focus:outline focus-visible:outline focus:outline-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:outline-2 active:outline-offset-2 active:outline active:outline-blue-500 ltr:mr-3 rtl:ml-3';

  return (
    <label className="my-2 flex items-start hover:cursor-pointer">
      <input
        type="checkbox"
        className={classNames(
          checkboxBaseClassNames,
          disabled && 'bg-grey-200',
          !disabled &&
            checked &&
            'bg-contain bg-no-repeat bg-blue-500 border-blue-500 active:bg-blue-800 active:border-blue-800 hover:bg-blue-600 hover:border-blue-600',
          !checked &&
            'bg-grey-50 active:bg-grey-200 hover:bg-grey-100 border-grey-300'
        )}
        onChange={checkboxChange}
        {...{
          defaultChecked,
          disabled,
        }}
      />
      <CheckWhite
        className={classNames('w-4 h-4 absolute', { 'opacity-0': !checked })}
        aria-hidden={true}
      />
      <span className="inline-block leading-tight">{label}</span>
    </label>
  );
};

export default InputCheckboxBlue;
