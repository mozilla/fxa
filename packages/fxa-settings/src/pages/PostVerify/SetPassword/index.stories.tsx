import React from 'react';
import { Meta } from '@storybook/react';
import { SetPassword } from './index';
import { SetPasswordProps } from './interfaces';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { syncEngineConfigs } from '../../../components/ChooseWhatToSync/sync-engines';

export default {
  title: 'Pages/PostVerify/SetPassword',
  component: SetPassword,
  decorators: [
    withLocalization,
    (Story) => {
      const [, setDeclinedSyncEngines] = React.useState<string[]>([]);
      return <Story {...{ setDeclinedSyncEngines }} />;
    },
  ],
} as Meta;

const defaultArgs: Omit<SetPasswordProps, 'setDeclinedSyncEngines'> = {
  bannerErrorText: '',
  email: 'test@example.com',
  createPasswordHandler: async (password: string) => {
    console.log('Password created:', password);
  },
  setCreatePasswordLoading: (loading: boolean) => {
    console.log('Loading state:', loading);
  },
  createPasswordLoading: false,
  offeredSyncEngineConfigs: syncEngineConfigs,
};

export const Default = ({
  setDeclinedSyncEngines,
}: Pick<SetPasswordProps, 'setDeclinedSyncEngines'>) => (
  <SetPassword
    {...defaultArgs}
    setDeclinedSyncEngines={setDeclinedSyncEngines}
  />
);

export const WithError = ({
  setDeclinedSyncEngines,
}: Pick<SetPasswordProps, 'setDeclinedSyncEngines'>) => (
  <SetPassword
    {...defaultArgs}
    bannerErrorText="An error occurred"
    setDeclinedSyncEngines={setDeclinedSyncEngines}
  />
);
