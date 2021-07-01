import React from 'react';
import { Story, Meta } from '@storybook/react';
import RenderedEmail, { RenderedEmailProps } from '../RenderedEmail';

export default {
  title: 'Emails',
} as Meta;

const Template: Story<RenderedEmailProps> = (args) => (
  <RenderedEmail {...args} />
);

export const CadReminder = Template.bind({});
CadReminder.args = {
  template: 'cadReminder',
  variables: {
    buttonText: 'Sync device',
    onDesktopOrTabletDevice: true,
    anotherDeviceURL:
      'http://localhost:3030/connect_another_device?utm_medium=email&utm_campaign=fx-cad-reminder-first&utm_content=fx-connect-device',
    iosURL: '',
    androidURL: '',
  },
};

export const Welcome = Template.bind({});
Welcome.args = {
  template: 'welcome',
};
