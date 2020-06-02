/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { UnitRow } from '.';
import { Modal } from '../Modal';

storiesOf('components/UnitRow', module)
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
      noHeaderValueCtaText="Custom CTA text"
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
            modalRevealed,
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
  );
