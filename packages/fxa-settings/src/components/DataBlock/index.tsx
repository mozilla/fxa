/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { copy } from '../../lib/clipboard';

export type DataBlockProps = {
  value: string | string[];
  onCopied?: (copiedValue: string) => void;
};

export const DataBlock = ({ value, onCopied }: DataBlockProps) => {
  const valueIsArray = Array.isArray(value);

  async function copyToClipboard() {
    const copyValue = valueIsArray
      ? (value as string[]).join(', ')
      : (value as string);

    await copy(copyValue);
    onCopied && onCopied(copyValue);
  }

  return (
    <button
      className={`flex rounded-xl px-7 font-mono text-sm text-green-900 bg-green-800 bg-opacity-10 flex-wrap hover:bg-opacity-20 focus:bg-opacity-30 active:bg-opacity-30 ${
        valueIsArray ? 'py-4' : 'py-5'
      }`}
      data-testid="datablock-button"
      onClick={copyToClipboard}
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
  );
};

export default DataBlock;
