/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, {
  useCallback,
  useState,
  useEffect,
  MouseEvent,
  FocusEvent,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { copy } from '../../lib/clipboard';

export type DataBlockProps = {
  value: string | string[];
  copyable?: boolean;
  id?: string;
  onCopied?: (copiedValue: string) => void;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onBlur?: (event: FocusEvent<HTMLButtonElement>) => void;
  onFocus?: (event: FocusEvent<HTMLButtonElement>) => void;
  readerText?: string;
};

export const DataBlock = ({
  value,
  id,
  copyable,
  onCopied,
  readerText,
}: DataBlockProps) => {
  const valueIsArray = Array.isArray(value);
  const [inputId, setInputId] = useState<string | undefined>(id);
  const readerId = `${inputId}-sr`;

  async function copyToClipboard() {
    const copyValue = valueIsArray
      ? (value as string[]).join(', ')
      : (value as string);

    await copy(copyValue);
    onCopied && onCopied(copyValue);
  }

  useEffect(() => {
    !inputId && setInputId(uuidv4());
  }, [inputId, id]);

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    copyable && copyToClipboard();
  };

  return (
    <>
      <button
        className={`flex rounded-xl px-7 font-mono text-sm text-green-900 bg-green-800 bg-opacity-10 flex-wrap ${
          valueIsArray ? 'py-4' : 'py-5'
        } ${
          copyable
            ? 'hover:bg-opacity-20 focus:bg-opacity-30 active:bg-opacity-30'
            : 'cursor-default select-text'
        }`}
        aria-describedby={readerText ? readerId : undefined}
        id={inputId}
        data-testid="datablock-button"
        disabled={!copyable}
        {...{ onClick }}
      >
        {valueIsArray ? (
          (value as string[]).map((item) => (
            <span key={item} className="flex-50% py-1">
              {item}
            </span>
          ))
        ) : (
          <span>{value}</span>
        )}
      </button>
      {readerText && (
        <span data-testid="datablock-srtext" className="sr-only" id={readerId}>
          {readerText}
        </span>
      )}
    </>
  );
};

export default DataBlock;
