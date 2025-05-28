/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import GetDataTrio, {
  DownloadContentType,
  GetDataCopySingleton,
  GetDataTrioGleanData,
} from '../GetDataTrio';
import { Tooltip } from '../Tooltip';
import { FtlMsg } from 'fxa-react/lib/utils';
import classNames from 'classnames';
import { ReactComponent as CodeIcon } from './code.min.svg';
const actionTypeToNotification = {
  download: 'Downloaded',
  copy: 'Copied',
  print: 'Printed',
} as const;

type actions = keyof typeof actionTypeToNotification;
type actionFn = (action: actions) => void;

export type DataBlockProps = {
  value: string | string[];
  contentType?: DownloadContentType;
  prefixDataTestId?: string;
  onCopy?: (event: React.ClipboardEvent<HTMLElement>) => void;
  onAction?: actionFn;
  isIOS?: boolean;
  email: string;
  gleanDataAttrs: {
    copy?: GetDataTrioGleanData;
    download?: GetDataTrioGleanData;
    print?: GetDataTrioGleanData;
  };
};

export const DataBlock = ({
  value,
  contentType,
  prefixDataTestId,
  onCopy,
  onAction = () => {},
  isIOS = false,
  email,
  gleanDataAttrs,
}: DataBlockProps) => {
  const valueIsArray = Array.isArray(value);
  const [performedAction, setPerformedAction] = useState<actions>();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const dataTestId = prefixDataTestId
    ? `${prefixDataTestId}-datablock`
    : 'datablock';
  const actionCb: actionFn = (action) => {
    onAction(action);

    if (actionTypeToNotification[action]) {
      setPerformedAction(action);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 items-center bg-white rounded-xl border-2 border-grey-100 px-5 pt-5 pb-3">
      <ul
        className={classNames(
          'relative gap-2 w-full text-black text-sm font-mono font-bold',
          valueIsArray ? 'grid grid-cols-2 max-w-sm' : 'flex flex-col max-w-lg'
        )}
        {...{ onCopy }}
        data-testid={dataTestId}
      >
        {(valueIsArray ? value : [value]).map((item) => (
          <li
            key={item}
            className="px-3 py-[10px] flex items-center gap-3 rounded-lg bg-gradient-to-tr from-blue-600/10 to-purple-500/10 text-center justify-center mobileLandscape:justify-start"
          >
            <CodeIcon
              className="w-6 h-auto hidden mobileLandscape:block"
              aria-hidden
            />
            {item}
          </li>
        ))}
        {performedAction && tooltipVisible && (
          <FtlMsg id={`datablock-${performedAction}`} attrs={{ message: true }}>
            <Tooltip
              prefixDataTestId={`datablock-${performedAction}`}
              message={actionTypeToNotification[performedAction]}
              anchorPosition="middle"
              position="bottom"
              className="mt-1"
            ></Tooltip>
          </FtlMsg>
        )}
      </ul>
      {isIOS ? (
        <GetDataCopySingleton
          {...{
            value,
            onAction: actionCb,
            setTooltipVisible,
            email,
            gleanDataAttrs,
          }}
        />
      ) : (
        <GetDataTrio
          {...{
            value,
            contentType,
            onAction: actionCb,
            setTooltipVisible,
            email,
            gleanDataAttrs,
          }}
        />
      )}
    </div>
  );
};

export default DataBlock;
