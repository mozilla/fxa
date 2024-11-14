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
        <h2 className="mb-2 font-bold">Choose what to sync</h2>
      </FtlMsg>
      <ul className="flex flex-wrap text-sm mb-4">
        {offeredSyncEngineConfigs.map((engineConfig) => {
          return (
            <li
              key={engineConfig.id}
              className="basis-1/2 mobileLandscape:ps-4 pe-2"
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
