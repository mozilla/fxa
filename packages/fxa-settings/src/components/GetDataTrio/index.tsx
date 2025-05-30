/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import { copy } from '../../lib/clipboard';
import { ReactComponent as CopyIcon } from './copy.min.svg';
import { ReactComponent as InlineCopyIcon } from './copy-inline.svg';
import { ReactComponent as DownloadIcon } from './download.min.svg';
import { ReactComponent as PrintIcon } from './print.min.svg';
import { useFtlMsgResolver } from '../../models';
import { FtlMsg } from 'fxa-react/lib/utils';
import { GleanClickEventType2FA } from '../../lib/types';

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
  type?: GleanClickEventType2FA;
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

const trioButtonClassName =
  'w-12 h-12 p-1 relative text-grey-600 text-sm rounded flex flex-col items-center justify-center hover:text-blue-600 active:text-blue-500 focus-visible-default outline-offset-2 hover:bg-gradient-to-tr hover:from-blue-600/10 hover:to-purple-500/10 active:bg-gradient-to-tr active:from-blue-600/10 active:to-purple-500/10 focus-visible:bg-gradient-to-tr focus-visible:from-blue-600/10 focus-visible:to-purple-500/10';

export const GetDataCopySingleton = ({
  value,
  onAction,
  setTooltipVisible,
  gleanDataAttrs,
}: Omit<GetDataTrioProps, 'email'>) => {
  return (
    <FtlMsg
      id="get-data-trio-copy-2"
      attrs={{ title: true, 'aria-label': true }}
    >
      <button
        type="button"
        title="Copy"
        aria-label="Copy"
        onClick={async () => {
          const copyValue = Array.isArray(value) ? value.join('\r\n') : value;
          await copy(copyValue);
          onAction?.('copy');
          setTooltipVisible(true);
        }}
        onBlur={() => setTooltipVisible(false)}
        data-testid="databutton-copy"
        className={trioButtonClassName}
        data-glean-id={gleanDataAttrs.copy?.id}
        data-glean-type={gleanDataAttrs.copy?.type}
      >
        <CopyIcon aria-hidden className="w-8 h-8 fill-current" />
      </button>
    </FtlMsg>
  );
};

export type GetDataCopySingletonInlineProps = {
  value: string;
  onAction?: () => void;
  setTooltipVisible: React.Dispatch<React.SetStateAction<boolean>>;
  gleanDataAttr?: GetDataTrioGleanData;
};

export const GetDataCopySingletonInline = ({
  value,
  onAction,
  setTooltipVisible,
  gleanDataAttr,
}: GetDataCopySingletonInlineProps) => {
  return (
    <FtlMsg
      id="get-data-trio-copy-2"
      attrs={{ title: true, 'aria-label': true }}
    >
      <button
        title="Copy"
        aria-label="Copy"
        type="button"
        onClick={async () => {
          const copyValue = Array.isArray(value) ? value.join('\r\n') : value;
          await copy(copyValue);
          onAction?.();
          setTooltipVisible(true);
        }}
        onBlur={() => setTooltipVisible(false)}
        data-testid="databutton-copy"
        data-glean-id={gleanDataAttr?.id}
        data-glean-type={gleanDataAttr?.type}
        className="-my-2 -me-4 p-3 rounded text-grey-500 bg-transparent border border-transparent hover:bg-grey-100 active:bg-grey-200 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 focus:bg-grey-50"
      >
        <InlineCopyIcon
          aria-hidden
          className="w-6 h-6 items-center justify-center stroke-current"
        />
      </button>
    </FtlMsg>
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
    <div className="flex justify-between max-w-52 w-4/5">
      <FtlMsg
        id="get-data-trio-download-2"
        attrs={{ title: true, 'aria-label': true }}
      >
        <a
          title="Download"
          aria-label="Download"
          href={URL.createObjectURL(
            new Blob(Array.isArray(value) ? [value.join('\r\n')] : [value], {
              type: 'text/plain',
            })
          )}
          download={`${email} ${contentType}.txt`}
          data-testid="databutton-download"
          className={trioButtonClassName}
          onClick={() => {
            onAction?.('download');
            setTooltipVisible(true);
          }}
          onBlur={() => {
            setTooltipVisible(false);
          }}
          data-glean-id={gleanDataAttrs.download?.id}
          data-glean-type={gleanDataAttrs.download?.type}
        >
          <DownloadIcon aria-hidden className="w-8 h-8 fill-current" />
        </a>
      </FtlMsg>

      <GetDataCopySingleton
        {...{ onAction, value, setTooltipVisible, gleanDataAttrs }}
      />

      {/** This only opens the page that is responsible
       *   for triggering the print screen.
       **/}
      <FtlMsg
        id="get-data-trio-download-2"
        attrs={{ title: true, 'aria-label': true }}
      >
        <button
          type="button"
          title="Print"
          aria-label="Print"
          onClick={() => {
            print();
            onAction?.('print');
            setTooltipVisible(true);
          }}
          onBlur={() => setTooltipVisible(false)}
          data-testid="databutton-print"
          className={trioButtonClassName}
          data-glean-id={gleanDataAttrs.print?.id}
          data-glean-type={gleanDataAttrs.print?.type}
        >
          <PrintIcon aria-hidden className="w-7 h-7 fill-current" />
        </button>
      </FtlMsg>
    </div>
  );
};

export default GetDataTrio;
