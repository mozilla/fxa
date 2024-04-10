/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ChangeEvent } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import InputCheckboxBlue from '../InputCheckboxBlue';
import { syncEngineConfigs } from './sync-engines';

export type ChooseWhatToSyncProps = {
  offeredSyncEngineConfigs: typeof syncEngineConfigs;
  setDeclinedSyncEngines: React.Dispatch<React.SetStateAction<string[]>>;
};

const ChooseWhatToSync = ({
  offeredSyncEngineConfigs,
  setDeclinedSyncEngines,
}: ChooseWhatToSyncProps) => {
  const handleSyncChange =
    (changedEngineId: string) => (event: ChangeEvent<HTMLInputElement>) => {
      const { checked } = event.target;
      setDeclinedSyncEngines((existing) => {
        if (checked) {
          return existing.filter((engineId) => engineId !== changedEngineId);
        } else if (!existing.includes(changedEngineId)) {
          return [...existing, changedEngineId];
        }
        return existing;
      });
    };

  return (
    <>
      <FtlMsg id="choose-what-to-sync-prompt-2">
        <h2 className="font-normal mb-4 text-base text-center">
          Choose what to sync
        </h2>
      </FtlMsg>
      <ul className="flex flex-wrap text-start text-sm mb-4 ltr:mobileLandscape:ml-6 rtl:mobileLandscape:mr-6">
        {offeredSyncEngineConfigs.map((engineConfig) => {
          return (
            <li
              key={engineConfig.id}
              className="flex-50% rtl:mobileLandscape:pr-6 ltr:mobileLandscape:pl-6 rtl:pr-3 ltr:pl-3"
            >
              <FtlMsg id={engineConfig.ftlId} attrs={{ label: true }}>
                <InputCheckboxBlue
                  label={engineConfig.text}
                  prefixDataTestId={engineConfig.id}
                  defaultChecked={engineConfig.defaultChecked}
                  onChange={handleSyncChange(engineConfig.id)}
                />
              </FtlMsg>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default ChooseWhatToSync;
