/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ChangeEvent } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import InputCheckboxBlue from '../InputCheckboxBlue';
import { Newsletter } from './newsletters';

export type ChooseNewslettersProps = {
  newsletters: Newsletter[];
  setSelectedNewsletterSlugs: React.Dispatch<React.SetStateAction<string[]>>;
};

const ChooseNewsletters = ({
  newsletters,
  setSelectedNewsletterSlugs,
}: ChooseNewslettersProps) => {
  const handleNewsletterChange =
    (slugs: Newsletter['slug']) => (event: ChangeEvent<HTMLInputElement>) => {
      const { checked } = event.target;
      setSelectedNewsletterSlugs((existing) => {
        if (checked) {
          return [...existing, ...slugs];
        } else {
          return existing.filter(
            (existingSlug) => !slugs.includes(existingSlug)
          );
        }
      });
    };

  return (
    <>
      <FtlMsg id="choose-newsletters-prompt-2">
        <h2 className="text-start text-base mb-4 font-bold">
          Get more from Mozilla:
        </h2>
      </FtlMsg>
      <ul className="flex flex-wrap text-start text-sm mb-4">
        {newsletters.map((newsletter) => {
          return (
            <li key={newsletter.ftlId}>
              <FtlMsg id={newsletter.ftlId} attrs={{ label: true }}>
                <InputCheckboxBlue
                  label={newsletter.label}
                  defaultChecked={false}
                  onChange={handleNewsletterChange(newsletter.slug)}
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
