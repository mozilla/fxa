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

export type DataBlockInlineProps = {
  value: string;
  prefixDataTestId?: string;
  onCopy?: (event: React.ClipboardEvent<HTMLDivElement>) => void;
  onAction?: () => void;
  gleanDataAttr?: GetDataTrioGleanData;
};

export const DataBlockInline = ({
  value,
  prefixDataTestId,
  onCopy,
  onAction = () => {},
  gleanDataAttr,
}: DataBlockInlineProps) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const dataTestId = prefixDataTestId
    ? `${prefixDataTestId}-datablock`
    : 'datablock';

  return (
    <div
      className="relative flex font-mono text-center text-sm font-bold text-black bg-gradient-to-tr from-blue-600/10 to-purple-500/10 border border-transparent max-w-lg flex-nowrap w-full rounded py-2 px-3"
      data-testid={dataTestId}
      {...{ onCopy }}
    >
      <span className="flex flex-col self-center align-middle grow">
        {value}
      </span>
      {tooltipVisible && (
        <FtlMsg id="datablock-copy" attrs={{ message: true }}>
          <Tooltip
            prefixDataTestId={`datablock-copy`}
            message="Copied"
            anchorPosition="end"
            position="top"
            className="mt-1"
          ></Tooltip>
        </FtlMsg>
      )}
      <GetDataCopySingletonInline
        {...{
          value,
          onAction,
          setTooltipVisible,
          gleanDataAttr,
        }}
      />
    </div>
  );
};

export default DataBlockInline;
