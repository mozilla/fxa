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
import { useFtlMsgResolver } from '../../models';
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
  isMobile?: boolean;
  email: string;
  gleanDataAttrs: {
    copy?: GetDataTrioGleanData;
    download?: GetDataTrioGleanData;
    print?: GetDataTrioGleanData;
  };
  setSuccessBannerMessage?: React.Dispatch<React.SetStateAction<string>>;
};

export const DataBlock = ({
  value,
  contentType,
  prefixDataTestId,
  onCopy,
  onAction = () => {},
  isMobile = false,
  email,
  gleanDataAttrs,
  setSuccessBannerMessage,
}: DataBlockProps) => {
  const ftlMsgResolver = useFtlMsgResolver();

  const valueIsArray = Array.isArray(value);
  const [performedAction, setPerformedAction] = useState<actions>();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const dataTestId = prefixDataTestId
    ? `${prefixDataTestId}-datablock`
    : 'datablock';

  const bannerFtlId: Record<actions, string> = {
    copy: 'datablock-copy-success',
    download: 'datablock-download-success',
    print: 'datablock-print-success',
  };

  const bannerFallback: Record<actions, string> = {
    copy: valueIsArray ? 'Codes copied' : 'Code copied',
    download: valueIsArray ? 'Codes downloaded' : 'Code downloaded',
    print: valueIsArray ? 'Codes printed' : 'Code printed',
  };

  const actionCb: actionFn = (action) => {
    onAction(action);

    if (actionTypeToNotification[action]) {
      setPerformedAction(action);
    }

    if (!setSuccessBannerMessage) {
      return;
    }

    const count = valueIsArray ? value.length : 1;

    // We provide the count to allow languages with more or less than two pluralization variants to adjust
    // the localization with the correct number of variants.
    // Languages with just two forms (English, French, Spanish) use [one] vs *[other].
    // Languages with three or more forms (Russian – few, many; Arabic – zero, two, etc.) can add those extra keys in their locale file without touching the code.
    // Languages with one form (Japanese, Chinese) ignore [one] and fall back to *[other].
    setSuccessBannerMessage(
      ftlMsgResolver.getMsg(bannerFtlId[action], bannerFallback[action], {
        count,
      })
    );
  };

  return (
    <div className="w-full flex flex-col items-center bg-white rounded-xl border-2 border-grey-100 p-4">
      <ul
        className={classNames(
          'relative gap-2 mobileLandscape:gap-3 w-full mb-4 text-black text-sm font-mono font-bold',
          valueIsArray
            ? 'grid grid-cols-2 max-w-sm justify-between'
            : 'flex flex-col max-w-lg'
        )}
        {...{ onCopy }}
        data-testid={dataTestId}
      >
        {(valueIsArray ? value : [value]).map((item) => (
          <li
            key={item}
            className="px-3 py-[8px] flex items-center gap-3 rounded-lg bg-gradient-to-tr from-blue-600/10 to-purple-500/10 text-center justify-center mobileLandscape:justify-start mobileLandscape:tracking-wide"
          >
            <CodeIcon
              className="w-6 h-auto hidden mobileLandscape:block"
              aria-hidden
            />
            {item}
          </li>
        ))}
        {!setSuccessBannerMessage && performedAction && tooltipVisible && (
          <FtlMsg id={`datablock-${performedAction}`} attrs={{ message: true }}>
            <Tooltip
              prefixDataTestId={`datablock-${performedAction}`}
              message={actionTypeToNotification[performedAction]}
              anchorPosition="middle"
              position="top"
              className="mt-1"
            ></Tooltip>
          </FtlMsg>
        )}
      </ul>
      {isMobile ? (
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
