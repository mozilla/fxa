/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import GetDataTrio, {
  DownloadContentType,
  GetDataCopySingleton,
  GetDataCopySingletonInline,
} from '../GetDataTrio';
import { Tooltip } from '../Tooltip';
import { FtlMsg } from 'fxa-react/lib/utils';
import classNames from 'classnames';
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
  separator?: string;
  onCopy?: (event: React.ClipboardEvent<HTMLDivElement>) => void;
  onAction?: actionFn;
  isIOS?: boolean;
  isInline?: boolean;
  email: string;
};

export const DataBlock = ({
  value,
  contentType,
  prefixDataTestId,
  separator,
  onCopy,
  onAction = () => {},
  isIOS = false,
  isInline = false,
  email,
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
    <div className="flex flex-col items-center">
      <div
        className={classNames(
          'relative flex rounded-lg px-6 font-mono text-center text-sm font-bold text-black bg-gradient-to-tr from-blue-600/10 to-purple-500/10 border border-transparent',
          valueIsArray ? 'max-w-sm py-4' : 'max-w-lg py-5',
          isInline ? 'flex-nowrap w-full my-2' : 'flex-wrap mb-8'
        )}
        data-testid={dataTestId}
        {...{ onCopy }}
      >
        {valueIsArray ? (
          (value as string[]).map((item) => (
            <span key={item} className="flex-50% py-1">
              {item}
              {separator || ''}
            </span>
          ))
        ) : (
          <span
            className={classNames({
              'flex flex-col self-center align-middle grow pe-5': isInline,
            })}
          >
            {value}
          </span>
        )}
        {performedAction && tooltipVisible && (
          <FtlMsg id={`datablock-${performedAction}`} attrs={{ message: true }}>
            <Tooltip
              prefixDataTestId={`datablock-${performedAction}`}
              message={actionTypeToNotification[performedAction]}
              anchorPosition={isInline ? 'end' : 'middle'}
              position={isInline ? 'top' : 'bottom'}
              className="mt-1"
            ></Tooltip>
          </FtlMsg>
        )}
        {isInline && (
          <GetDataCopySingletonInline
            {...{ value, onAction: actionCb, setTooltipVisible, email }}
          />
        )}
      </div>
      {isIOS && !isInline && (
        <GetDataCopySingleton
          {...{ value, onAction: actionCb, setTooltipVisible, email }}
        />
      )}
      {!isIOS && !isInline && (
        <GetDataTrio
          {...{
            value,
            contentType,
            onAction: actionCb,
            setTooltipVisible,
            email,
          }}
        />
      )}
    </div>
  );
};

export default DataBlock;
