import React from 'react';
import { FlowContainer } from '../FlowContainer';
import { ProgressBar } from '../ProgressBar';
import { SecurityShieldImage } from '../../images';
import { ShieldIconListItem, KeyIconListItem } from '../../IconListItem';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../../models';

export type RecoveryKeyAddWizardViewOneProps = {
  navigateForward: () => void;
  navigateBackward: () => void;
};
// metrics
// tests

export const RecoveryKeyAddWizardViewOne = ({
  navigateForward,
  navigateBackward,
}: RecoveryKeyAddWizardViewOneProps) => {
  const ftlMsgResolver = useFtlMsgResolver();

  const localizedContainerPageTitle = ftlMsgResolver.getMsg(
    'recovery-key-add-wizard-first-view-page-title',
    'Account Recovery Key'
  );

  return (
    <FlowContainer
      title={localizedContainerPageTitle}
      customBackButtonTitle="Settings"
      customBackButtonLocalizationId="recovery-key-add-wizard-flow-first-step-back-button-title"
      onBackButtonClick={navigateBackward}
    >
      <div className="w-full flex flex-col">
        <ProgressBar currentStep={1} numberOfSteps={4} />
        <SecurityShieldImage className="mx-auto my-6" />
        <FtlMsg
          id="recovery-key-add-wizard-flow-first-step-header"
          elems={{
            heading: (
              <h2 className="font-bold text-xl mb-4">
                Create an account recovery key in case you forget your password
              </h2>
            ),
          }}
        >
          <h2 className="font-bold text-xl mb-4">
            Create an account recovery key in case you forget your password
          </h2>
        </FtlMsg>
        <ul>
          <ShieldIconListItem>
            <FtlMsg id="recovery-key-add-wizard-flow-first-step-shield-bullet-point">
              <p className="text-sm">
                We encrypt browsing data –– passwords, bookmarks, and more. It’s
                great for privacy, but it means we can’t recover your data if
                you forget your password.
              </p>
            </FtlMsg>
          </ShieldIconListItem>
          <KeyIconListItem>
            <FtlMsg id="recovery-key-add-wizard-flow-first-step-key-bullet-point">
              <p className="text-sm">
                That’s why creating an account recovery key is so important ––
                you can use your key to get your data back
              </p>
            </FtlMsg>
          </KeyIconListItem>
        </ul>
        <FtlMsg
          id="recovery-key-add-wizard-flow-first-step-cta-text"
          elems={{
            button: (
              <button
                className="cta-primary cta-base-p text-sm my-2"
                type="button"
                onClick={() => navigateForward}
              >
                Start creating your recovery key
              </button>
            ),
          }}
        >
          <button
            className="cta-primary cta-base-p text-sm my-2"
            type="button"
            onClick={() => navigateForward}
          >
            Start creating your recovery key
          </button>
        </FtlMsg>
      </div>
    </FlowContainer>
  );
};

export default RecoveryKeyAddWizardViewOne;
