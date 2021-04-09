/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { LocationProvider } from '@reach/router';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { MockedCache } from '../../models/_mocks';
import { HomePath } from '../../constants';
import { UnitRow } from '.';
import { Modal } from '../Modal';

storiesOf('Components|UnitRow', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('basic, with falsey headerValue', () => (
    <UnitRow header="Some header" headerValue={null} />
  ))
  .add('with CTA and falsey headerValue', () => (
    <UnitRow header="Display name" headerValue={null} route="#" />
  ))
  .add('with CTA, falsey headerValue, and custom CTA text', () => (
    <UnitRow
      header="Display name"
      headerValue={null}
      ctaText="Custom CTA text"
      route="#"
    />
  ))
  .add('with CTA and truthy headerValue', () => (
    <UnitRow header="Display name" headerValue="Fred Flinstone" route="#" />
  ))
  .add('with CTA, truthy headerValue, and child elements', () => (
    <UnitRow header="Display name" headerValue="Fred Flinstone" route="#">
      <p className="text-sm mt-3">Content goes here.</p>
      <p className="text-grey-400 text-xs mt-2">More content.</p>
    </UnitRow>
  ))
  .add(
    'with modal-triggering CTA, falsey headerValue, and child elements',
    () => {
      const [modalRevealed, revealModal, hideModal] = useBooleanState();
      return (
        <UnitRow
          header="Display name"
          headerValue={null}
          {...{
            revealModal,
          }}
        >
          <p className="text-sm mt-3">Content goes here.</p>
          <p className="text-grey-400 text-xs mt-2">More content.</p>

          {modalRevealed && (
            <Modal onDismiss={hideModal} headerId="some-id" descId="some-desc">
              <h2 id="some-id" className="font-bold text-xl text-center mb-2">
                Modal header
              </h2>
              <p id="some-desc">Modal description here.</p>
            </Modal>
          )}
        </UnitRow>
      );
    }
  )
  .add('with modal-triggering secondary CTA', () => {
    const [
      secondaryModalRevealed,
      revealSecondaryModal,
      hideModal,
    ] = useBooleanState();
    return (
      <UnitRow
        header="Display name"
        headerValue={null}
        {...{
          secondaryButtonClassName: 'bg-red-500 text-white border-red-600',
          revealSecondaryModal,
          ctaText: 'Change',
          route: '#',
        }}
      >
        <p className="text-sm mt-3">Content goes here.</p>
        <p className="text-grey-400 text-xs mt-2">More content.</p>

        {secondaryModalRevealed && (
          <Modal onDismiss={hideModal} headerId="some-id" descId="some-desc">
            <h2 id="some-id" className="font-bold text-xl text-center mb-2">
              Modal header
            </h2>
            <p id="some-desc">Modal description here.</p>
          </Modal>
        )}
      </UnitRow>
    );
  })
  .add('with default avatar', () => {
    const avatar = {
      id: null,
      url: null,
      isDefault: true,
    };
    return (
      <MockedCache account={{ avatar }}>
        <UnitRow
          header="Picture"
          headerId="profile-picture"
          headerValue={!avatar.isDefault}
          route={`${HomePath}/avatar`}
          {...{ avatar }}
        />
      </MockedCache>
    );
  })
  .add('with non-default avatar', () => {
    const avatar = {
      id: null,
      url: 'http://placekitten.com/512/512?image=0',
      isDefault: false,
    };
    return (
      <MockedCache account={{ avatar }}>
        <UnitRow
          header="Picture"
          headerId="profile-picture"
          headerValue={!avatar.isDefault}
          route={`${HomePath}/avatar`}
          {...{ avatar }}
        />
      </MockedCache>
    );
  });
