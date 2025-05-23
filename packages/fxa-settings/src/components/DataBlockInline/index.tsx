/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import {
  GetDataCopySingletonInline,
  GetDataTrioGleanData,
} from '../GetDataTrio';
import { Tooltip } from '../Tooltip';
import { FtlMsg } from 'fxa-react/lib/utils';

const actionTypeToNotification = {
  download: 'Downloaded',
  copy: 'Copied',
  print: 'Printed',
} as const;

type actions = keyof typeof actionTypeToNotification;
type actionFn = (action: actions) => void;

export type DataBlockInlineProps = {
  value: string;
  prefixDataTestId?: string;
  onCopy?: (event: React.ClipboardEvent<HTMLDivElement>) => void;
  onAction?: actionFn;
  email: string;
  gleanDataAttrs: {
    copy?: GetDataTrioGleanData;
    download?: GetDataTrioGleanData;
    print?: GetDataTrioGleanData;
  };
};

export const DataBlockInline = ({
  value,
  prefixDataTestId,
  onCopy,
  onAction = () => {},
  email,
  gleanDataAttrs,
}: DataBlockInlineProps) => {
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
    <div
      className="relative flex font-mono text-center text-sm font-bold text-black bg-gradient-to-tr from-blue-600/10 to-purple-500/10 border border-transparent max-w-lg flex-nowrap w-full rounded py-2 px-3"
      data-testid={dataTestId}
      {...{ onCopy }}
    >
      <span className="flex flex-col self-center align-middle grow">
        {value}
      </span>
      {performedAction && tooltipVisible && (
        <FtlMsg id={`datablock-${performedAction}`} attrs={{ message: true }}>
          <Tooltip
            prefixDataTestId={`datablock-${performedAction}`}
            message={actionTypeToNotification[performedAction]}
            anchorPosition="end"
            position="top"
            className="mt-1"
          ></Tooltip>
        </FtlMsg>
      )}
      <GetDataCopySingletonInline
        {...{
          value,
          onAction: actionCb,
          setTooltipVisible,
          email,
          gleanDataAttrs,
        }}
      />
    </div>
  );
};

export default DataBlockInline;
