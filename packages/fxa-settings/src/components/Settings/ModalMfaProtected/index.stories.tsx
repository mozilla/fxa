/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import { useState } from 'react';
import { ModalMfaProtected } from '.';
import { MfaReason } from '../../../lib/types';
import { MOCK_EMAIL } from '../../../pages/mocks';

export default {
  title: 'Components/Settings/ModalMfaProtected',
  component: ModalMfaProtected,
  decorators: [withLocalization, withLocation()],
} as Meta;

export const DefaultWithValidCode123456 = () => {
  const [modalRevealed, showModal, hideModal] = useBooleanState(true);
  const [localizedErrorBannerMessage, setLocalizedErrorBannerMessage] =
    useState<string | undefined>(undefined);
  const [showResendSuccessBanner, setShowResendSuccessBanner] =
    useState<boolean>(false);

  const dismiss = () => {
    hideModal();
    setLocalizedErrorBannerMessage(undefined);
    setShowResendSuccessBanner(false);
  };

  return (
    <>
      <button
        className="cta-base-p cta-neutral"
        onClick={(event) => {
          event.stopPropagation();
          showModal();
        }}
      >
        Show modal
      </button>
      {modalRevealed && (
        <ModalMfaProtected
          email={MOCK_EMAIL}
          expirationTime={5}
          reason={MfaReason.test}
          onSubmit={(code) => {
            action('Submitted')(code);
            if (code === '123456') {
              dismiss();
            } else {
              setLocalizedErrorBannerMessage(
                'Invalid or expired confirmation code.'
              );
              setShowResendSuccessBanner(false);
            }
          }}
          {...{
            localizedErrorBannerMessage: localizedErrorBannerMessage,
            showResendSuccessBanner,
          }}
          clearErrorMessage={() => {
            setLocalizedErrorBannerMessage(undefined);
          }}
          onDismiss={dismiss}
          handleResendCode={() => {
            setShowResendSuccessBanner(true);
          }}
          resendCodeLoading={false}
        />
      )}
    </>
  );
};
