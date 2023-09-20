/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ChangeEvent } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import InputCheckboxBlue from '../InputCheckboxBlue';
import { Engine } from './sync-engines';

export type ChooseWhatToSyncProps = {
  engines: Engine[];
  setSelectedEngines: React.Dispatch<React.SetStateAction<string[]>>;
};

const ChooseWhatToSync = ({
  engines,
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
      <FtlMsg id="choose-what-to-sync-prompt-2">
        <h2 className="font-normal mb-4 text-base text-center">
          Choose what to sync
        </h2>
      </FtlMsg>
      <ul className="flex flex-wrap text-start text-sm mb-4 ltr:mobileLandscape:ml-6 rtl:mobileLandscape:mr-6">
        {engines.map((engine) => {
          return (
            <li
              key={engine.id}
              className="flex-50% rtl:mobileLandscape:pr-6 ltr:mobileLandscape:pl-6 rtl:pr-3 ltr:pl-3"
            >
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
