/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { SETTINGS_PATH } from '../../../constants';
import { UnitRow } from '.';
import { Modal } from '../Modal';
import { AppContext } from 'fxa-settings/src/models';
import { PLACEHOLDER_IMAGE_URL } from '../../../pages/mocks';

export const MOCK_HEADER = 'Some header';
export const MOCK_HEADER_VALUE = 'Some header value';
export const MOCK_CTA_TEXT = 'Another action';
export const MOCK_CHILD_ELEM: React.ReactNode = (
  <>
    <p className="text-sm mt-3">Content goes here.</p>
    <p className="text-grey-400 text-xs mt-2">More content.</p>
  </>
);

export const SubjectWithModal = () => {
  const [modalRevealed, revealModal, hideModal] = useBooleanState();
  return (
    <UnitRow
      header={MOCK_HEADER}
      {...{
        revealModal,
      }}
    >
      {MOCK_CHILD_ELEM}

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
};

export const SubjectWithSecondaryModal = () => {
  const [secondaryModalRevealed, revealSecondaryModal, hideModal] =
    useBooleanState();
  return (
    <UnitRow
      header={MOCK_HEADER}
      headerValue={MOCK_HEADER_VALUE}
      {...{
        secondaryButtonClassName: 'bg-red-500 text-white border-red-600',
        revealSecondaryModal,
        route: '#',
      }}
    >
      {MOCK_CHILD_ELEM}

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
};

export const SubjectWithDefaultAvatar = () => {
  const avatar = {
    id: null,
    url: null,
    isDefault: true,
  };
  return (
    <AppContext.Provider value={{ account: { avatar } as any }}>
      <UnitRow
        header="Picture"
        headerId="profile-picture"
        headerValue={!avatar.isDefault}
        route={`${SETTINGS_PATH}/avatar`}
        {...{ avatar }}
      />
    </AppContext.Provider>
  );
};

export const SubjectWithCustomAvatar = () => {
  const avatar = {
    id: null,
    url: PLACEHOLDER_IMAGE_URL,
    isDefault: false,
  };
  return (
    <AppContext.Provider value={{ account: { avatar } as any }}>
      <UnitRow
        header="Picture"
        headerId="profile-picture"
        headerValue={!avatar.isDefault}
        route={`${SETTINGS_PATH}/avatar`}
        {...{ avatar }}
      />
    </AppContext.Provider>
  );
};
