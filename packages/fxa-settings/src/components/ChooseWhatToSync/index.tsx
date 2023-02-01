/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ChangeEvent } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import InputCheckboxBlue from '../InputCheckboxBlue';
import { Engine } from './sync-engines';

export type ChooseWhatToSyncProps = {
  engines: Engine[];
  selectedEngines: string[];
  setSelectedEngines: React.Dispatch<React.SetStateAction<string[]>>;
};

const ChooseWhatToSync = ({
  engines,
  selectedEngines,
  setSelectedEngines,
}: ChooseWhatToSyncProps) => {
  const handleSyncChange =
    (labelText: string) => (event: ChangeEvent<HTMLInputElement>) => {
      const { checked } = event.target;
      setSelectedEngines((existing) => {
        if (checked) {
          return [...existing, labelText];
        } else {
          return [...existing.filter((text) => text !== labelText)];
        }
      });
    };

  return (
    <>
      <FtlMsg id="choose-what-to-sync-prompt">
        <p className="text-start mb-1">Choose what to sync:</p>
      </FtlMsg>
      <ul className="flex flex-wrap text-start text-sm mb-4">
        {engines.map((engine) => {
          return (
            <li key={engine.id} className="flex-50%">
              <FtlMsg id={engine.ftlId} attrs={{ label: true }}>
                <InputCheckboxBlue
                  label={engine.text}
                  prefixDataTestId={engine.id}
                  defaultChecked={engine.defaultChecked}
                  onChange={handleSyncChange(engine.text)}
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
