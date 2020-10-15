/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import { copy } from '../../lib/clipboard';
import { ReactComponent as CopyIcon } from './copy.svg';
import { ReactComponent as DownloadIcon } from './download.svg';
import { ReactComponent as PrintIcon } from './print.svg';

export type GetDataTrioProps = {
  value: string | string[];
};

export const GetDataTrio = ({ value }: GetDataTrioProps) => {
  const print = useCallback(() => {
    const printWindow = window.open('', 'Print', 'height=600,width=800')!;
    printWindow.document.write(Array.isArray(value) ? value.join('\n') : value);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, [value]);
  return (
    <div className="flex justify-between w-4/5 max-w-48">
      <a
        title="Download"
        href={URL.createObjectURL(
          new Blob(Array.isArray(value) ? value : [value], {
            type: 'text/plain',
          })
        )}
        download
        data-testid="databutton-download"
        className="w-12 h-12 relative inline-block text-grey-500 rounded active:text-blue-500"
      >
        <DownloadIcon
          height="24"
          width="18"
          className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 fill-current"
        />
      </a>

      <button
        title="Copy"
        type="button"
        onClick={async () => {
          const copyValue = Array.isArray(value) ? value.join(', ') : value;
          await copy(copyValue);
        }}
        data-testid="databutton-copy"
        className="w-12 h-12 relative inline-block text-grey-500 rounded active:text-blue-500"
      >
        <CopyIcon
          width="21"
          height="24"
          className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 fill-current"
        />
      </button>

      {/** This only opens the page that is responsible
       *   for triggering the print screen.
       **/}
      <button
        title="Print"
        type="button"
        onClick={print}
        data-testid="databutton-print"
        className="w-12 h-12 relative inline-block text-grey-500 rounded active:text-blue-500"
      >
        <PrintIcon
          height="24"
          width="24"
          className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 fill-current"
        />
      </button>
    </div>
  );
};

export default GetDataTrio;
