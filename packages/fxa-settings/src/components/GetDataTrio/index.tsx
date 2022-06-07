/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import { Localized, useLocalization } from '@fluent/react';
import { copy } from '../../lib/clipboard';
import { ReactComponent as CopyIcon } from './copy.svg';
import { ReactComponent as DownloadIcon } from './download.svg';
import { ReactComponent as PrintIcon } from './print.svg';
import { useAccount } from '../../models';

export type GetDataTrioProps = {
  value: string | string[];
  onAction?: (type: 'download' | 'copy' | 'print') => void;
};

const recoveryCodesPrintTemplate = (
  recoveryCodes: string | string[],
  title: string
) => {
  if (typeof recoveryCodes === 'string') recoveryCodes = [recoveryCodes];
  return `
    <html>
    <head><title>${title}</title></head>
    <body>
    ${recoveryCodes.map((code: string) => `<p>${code}</p>`).join('')}
    </body>
    </html>
  `;
};

export const GetDataTrio = ({ value, onAction }: GetDataTrioProps) => {
  const { l10n } = useLocalization();
  const pageTitle = l10n.getString(
    'get-data-trio-title',
    null,
    'Recovery Codes'
  );
  const print = useCallback(() => {
    const printWindow = window.open('', 'Print', 'height=600,width=800')!;
    printWindow.document.write(recoveryCodesPrintTemplate(value, pageTitle));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, [value, pageTitle]);
  const { primaryEmail } = useAccount();

  return (
    <div className="flex justify-between w-4/5 max-w-48">
      <Localized id="get-data-trio-download" attrs={{ title: true }}>
        <a
          title="Download"
          href={URL.createObjectURL(
            new Blob(Array.isArray(value) ? [value.join('\r\n')] : [value], {
              type: 'text/plain',
            })
          )}
          download={`${primaryEmail.email} Firefox.txt`}
          data-testid="databutton-download"
          className="w-12 h-12 relative inline-block text-grey-500 rounded active:text-blue-500 active:outline-dotted active:outline-black focus:outline-dotted focus:outline-black hover:bg-grey-50"
          onClick={() => onAction?.('download')}
        >
          <DownloadIcon
            height="24"
            width="18"
            className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 fill-current"
          />
        </a>
      </Localized>

      <Localized id="get-data-trio-copy" attrs={{ title: true }}>
        <button
          title="Copy"
          type="button"
          onClick={async () => {
            const copyValue = Array.isArray(value) ? value.join('\r\n') : value;
            await copy(copyValue);
            onAction?.('copy');
          }}
          data-testid="databutton-copy"
          className="w-12 h-12 relative inline-block text-grey-500 rounded active:text-blue-500 active:outline-dotted active:outline-black focus:outline-dotted focus:outline-black hover:bg-grey-50"
        >
          <CopyIcon
            width="21"
            height="24"
            className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 fill-current"
          />
        </button>
      </Localized>

      {/** This only opens the page that is responsible
       *   for triggering the print screen.
       **/}
      <Localized id="get-data-trio-print" attrs={{ title: true }}>
        <button
          title="Print"
          type="button"
          onClick={() => {
            print();
            onAction?.('print');
          }}
          data-testid="databutton-print"
          className="w-12 h-12 relative inline-block text-grey-500 rounded active:text-blue-500 active:outline-dotted active:outline-black focus:outline-dotted focus:outline-black hover:bg-grey-50"
        >
          <PrintIcon
            height="24"
            width="24"
            className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 fill-current"
          />
        </button>
      </Localized>
    </div>
  );
};

export default GetDataTrio;
