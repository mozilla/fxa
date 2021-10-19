/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { UnitRowSecondaryEmail } from '.';
import { mockAppContext, mockEmail } from '../../models/mocks';
import { LocationProvider } from '@reach/router';

import { AppContext } from 'fxa-settings/src/models';

storiesOf('Components/UnitRowSecondaryEmail', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('No secondary email set', () => <UnitRowSecondaryEmail />)
  .add('One secondary email set, unverified', () => {
    const emails = [
      mockEmail('johndope@example.com'),
      mockEmail('johndope2@example.com', false, false),
    ];
    return (
      <AppContext.Provider
        value={mockAppContext({ account: { emails } as any })}
      >
        <UnitRowSecondaryEmail />
      </AppContext.Provider>
    );
  })
  .add('One secondary email set, verified', () => {
    const emails = [
      mockEmail('johndope@example.com'),
      mockEmail('johndope2@example.com', false),
    ];
    return (
      <AppContext.Provider
        value={mockAppContext({ account: { emails } as any })}
      >
        <UnitRowSecondaryEmail />
      </AppContext.Provider>
    );
  })
  .add('Multiple secondary emails set, all verified', () => {
    const emails = [
      mockEmail('johndope@example.com'),
      mockEmail('johndope2@example.com', false),
      mockEmail('johndope3@example.com', false),
      mockEmail('johndope4@example.com', false),
    ];
    return (
      <AppContext.Provider
        value={mockAppContext({ account: { emails } as any })}
      >
        <UnitRowSecondaryEmail />
      </AppContext.Provider>
    );
  })
  .add('Multiple secondary emails set, one unverified', () => {
    const emails = [
      mockEmail('johndope@example.com'),
      mockEmail('johndope2@example.com', false),
      mockEmail('johndope3@example.com', false, false),
      mockEmail('johndope4@example.com', false),
    ];
    return (
      <AppContext.Provider
        value={mockAppContext({ account: { emails } as any })}
      >
        <UnitRowSecondaryEmail />
      </AppContext.Provider>
    );
  })
  .add('Multiple secondary emails set, multiple unverified', () => {
    const emails = [
      mockEmail('johndope@example.com'),
      mockEmail('johndope2@example.com', false),
      mockEmail('johndope3@example.com', false, false),
      mockEmail('johndope4@example.com', false, false),
    ];
    return (
      <AppContext.Provider
        value={mockAppContext({ account: { emails } as any })}
      >
        <UnitRowSecondaryEmail />
      </AppContext.Provider>
    );
  });
