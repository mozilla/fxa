/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import { copy } from '../../lib/clipboard';
import { ReactComponent as CopyIcon } from './copy.svg';
import { ReactComponent as InlineCopyIcon } from './copy-inline.svg';
import { ReactComponent as DownloadIcon } from './download.svg';
import { ReactComponent as PrintIcon } from './print.svg';
import { useFtlMsgResolver } from '../../models';
import { FtlMsg } from 'fxa-react/lib/utils';

export type DownloadContentType =
  | 'Firefox account recovery key'
  | 'Backup authentication codes'
  | 'Firefox';

const DownloadContentTypeL10nMapping: Record<DownloadContentType, string> = {
  Firefox: 'get-data-trio-title-firefox',
  'Backup authentication codes':
    'get-data-trio-title-backup-verification-codes',
  'Firefox account recovery key': 'get-data-trio-title-firefox-recovery-key',
};

export interface GetDataTrioGleanData {
  id:
    | 'two_step_auth_codes_download'
    | 'two_step_auth_codes_copy'
    | 'two_step_auth_codes_print'
    | 'account_pref_recovery_key_copy';
  type?: 'setup' | 'inline setup' | 'replace';
}

export type GetDataTrioProps = {
  value: string | string[];
  contentType?: DownloadContentType;
  onAction?: (type: 'download' | 'copy' | 'print') => void;
  setTooltipVisible: React.Dispatch<React.SetStateAction<boolean>>;
  email: string;
  gleanDataAttrs: {
    copy?: GetDataTrioGleanData;
    download?: GetDataTrioGleanData;
    print?: GetDataTrioGleanData;
  };
};

export const GetDataCopySingleton = ({
  value,
  onAction,
  setTooltipVisible,
  gleanDataAttrs,
}: GetDataTrioProps) => {
  return (
    <FtlMsg id="get-data-trio-copy-2" attrs={{ title: true, ariaLabel: true }}>
      <button
        title="Copy"
        type="button"
        onClick={async () => {
          const copyValue = Array.isArray(value) ? value.join('\r\n') : value;
          await copy(copyValue);
          onAction?.('copy');
          setTooltipVisible(true);
        }}
        onBlur={() => setTooltipVisible(false)}
        data-testid="databutton-copy"
        className="w-12 h-12 relative inline-block text-grey-500 rounded active:text-blue-600 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 hover:bg-grey-50"
        {...(gleanDataAttrs?.copy && {
          'data-glean-id': gleanDataAttrs.copy.id,
        })}
        {...(gleanDataAttrs?.copy?.type && {
          'data-glean-type': gleanDataAttrs.copy.type,
        })}
      >
        <CopyIcon
          aria-label="Copy"
          width="21"
          height="24"
          className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 fill-current"
        />
      </button>
    </FtlMsg>
  );
};

export const GetDataCopySingletonInline = ({
  value,
  onAction,
  setTooltipVisible,
  gleanDataAttrs,
}: GetDataTrioProps) => {
  return (
    <>
      <FtlMsg
        id="get-data-trio-copy-2"
        attrs={{ title: true, ariaLabel: true }}
      >
        <button
          title="Copy"
          type="button"
          onClick={async () => {
            const copyValue = Array.isArray(value) ? value.join('\r\n') : value;
            await copy(copyValue);
            onAction?.('copy');
            setTooltipVisible(true);
          }}
          onBlur={() => setTooltipVisible(false)}
          data-testid="databutton-copy"
          {...(gleanDataAttrs?.copy && {
            'data-glean-id': gleanDataAttrs.copy.id,
          })}
          {...(gleanDataAttrs?.copy?.type && {
            'data-glean-type': gleanDataAttrs.copy.type,
          })}
          className="-my-3 -me-4 p-3 rounded text-grey-500 bg-transparent border border-transparent hover:bg-grey-100 active:bg-grey-200 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 focus:bg-grey-50"
        >
          <InlineCopyIcon
            aria-label="Copy"
            className="w-6 h-6 items-center justify-center stroke-current"
          />
        </button>
      </FtlMsg>
    </>
  );
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

export const GetDataTrio = ({
  value,
  contentType,
  onAction,
  setTooltipVisible,
  email,
  gleanDataAttrs,
}: GetDataTrioProps) => {
  const ftlMsgResolver = useFtlMsgResolver();

  // Fall back to 'Firefox' just in case.
  if (contentType == null) {
    contentType = 'Firefox';
  }

  const pageTitleId = DownloadContentTypeL10nMapping[contentType];

  const pageTitle = ftlMsgResolver.getMsg(pageTitleId, contentType);

  const print = useCallback(() => {
    const printWindow = window.open('', 'Print', 'height=600,width=800')!;
    printWindow.document.write(recoveryCodesPrintTemplate(value, pageTitle));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, [value, pageTitle]);

  return (
    <div className="flex justify-between w-4/5 max-w-48">
      <FtlMsg
        id="get-data-trio-download-2"
        attrs={{ title: true, ariaLabel: true }}
      >
        <a
          title="Download"
          href={URL.createObjectURL(
            new Blob(Array.isArray(value) ? [value.join('\r\n')] : [value], {
              type: 'text/plain',
            })
          )}
          download={`${email} ${contentType}.txt`}
          data-testid="databutton-download"
          className="w-12 h-12 relative inline-block text-grey-500 rounded active:text-blue-600 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 hover:bg-grey-50"
          onClick={() => {
            onAction?.('download');
            setTooltipVisible(true);
          }}
          onBlur={() => {
            setTooltipVisible(false);
          }}
          {...(gleanDataAttrs?.download && {
            'data-glean-id': gleanDataAttrs.download.id,
          })}
          {...(gleanDataAttrs?.download?.type && {
            'data-glean-type': gleanDataAttrs.download.type,
          })}
        >
          <DownloadIcon
            aria-label="Download"
            height="24"
            width="18"
            className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 fill-current"
          />
        </a>
      </FtlMsg>

      <GetDataCopySingleton
        {...{ onAction, value, setTooltipVisible, email, gleanDataAttrs }}
      />

      {/** This only opens the page that is responsible
       *   for triggering the print screen.
       **/}
      <FtlMsg
        id="get-data-trio-print-2"
        attrs={{ title: true, ariaLabel: true }}
      >
        <button
          title="Print"
          type="button"
          onClick={() => {
            print();
            onAction?.('print');
            setTooltipVisible(true);
          }}
          onBlur={() => setTooltipVisible(false)}
          data-testid="databutton-print"
          className="w-12 h-12 relative inline-block text-grey-500 rounded active:text-blue-600 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 hover:bg-grey-50"
          {...(gleanDataAttrs?.print && {
            'data-glean-id': gleanDataAttrs.print.id,
          })}
          {...(gleanDataAttrs?.print?.type && {
            'data-glean-type': gleanDataAttrs.print.type,
          })}
        >
          <PrintIcon
            aria-label="Print"
            height="24"
            width="24"
            className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 fill-current"
          />
        </button>
      </FtlMsg>
    </div>
  );
};

export default GetDataTrio;
