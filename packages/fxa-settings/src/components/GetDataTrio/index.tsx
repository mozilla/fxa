/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { copy } from '../../lib/clipboard';
import { ReactComponent as CopyIcon } from './copy.svg';
import { ReactComponent as DownloadIcon } from './download.svg';
import { ReactComponent as PrintIcon } from './print.svg';

export type GetDataTrioProps = {
  value: string | string[];
  url: string;
};

export const GetDataTrio = ({ value, url }: GetDataTrioProps) => {
  return (
    <div className="flex justify-between max-w-48">
      <a
        title="Download"
        href={url}
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
      <a
        title="Print"
        data-testid="databutton-print"
        href={url}
        target="_blank"
        className="w-12 h-12 relative inline-block text-grey-500 rounded active:text-blue-500"
      >
        <PrintIcon
          height="24"
          width="24"
          className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 fill-current"
        />
      </a>
    </div>
  );
};

export default GetDataTrio;
