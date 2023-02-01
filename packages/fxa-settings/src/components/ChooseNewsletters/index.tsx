/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ChangeEvent } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import InputCheckboxBlue from '../InputCheckboxBlue';
import { Newsletter } from './newsletters';

export type ChooseNewslettersProps = {
  newsletters: Newsletter[];
  selectedNewsletters: string[];
  setSelectedNewsletters: React.Dispatch<React.SetStateAction<string[]>>;
};

const ChooseNewsletters = ({
  newsletters,
  selectedNewsletters,
  setSelectedNewsletters,
}: ChooseNewslettersProps) => {
  const handleSyncChange =
    (labelText: string) => (event: ChangeEvent<HTMLInputElement>) => {
      const { checked } = event.target;
      setSelectedNewsletters((existing) => {
        if (checked) {
          return [...existing, labelText];
        } else {
          return [...existing.filter((text) => text !== labelText)];
        }
      });
    };

  return (
    <>
      <FtlMsg id="choose-newsletters-prompt">
        <p className="text-start mb-1">
          Practical knowledge is coming to your inbox. Sign up for more:
        </p>
      </FtlMsg>
      <ul className="flex flex-wrap text-start text-sm mb-4">
        {newsletters.map((newsletter) => {
          return (
            <li key={newsletter.ftlId}>
              <FtlMsg id={newsletter.ftlId} attrs={{ label: true }}>
                <InputCheckboxBlue
                  label={newsletter.label}
                  defaultChecked={false}
                  onChange={handleSyncChange(newsletter.label)}
                />
              </FtlMsg>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default ChooseNewsletters;
