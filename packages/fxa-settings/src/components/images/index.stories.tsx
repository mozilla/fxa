/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';

import {
  EmailCodeImage,
  HeartsBrokenImage,
  HeartsVerifiedImage,
  LightbulbImage,
  PasswordImage,
  MailImage,
  BackupCodesImage,
  RecoveryKeyImage,
  TwoFactorAuthImage,
  PasswordSuccessImage,
  BackupRecoveryPhoneImage,
  BackupRecoveryPhoneCodeImage,
  BackupRecoveryPhoneSmsImage,
  BackupAuthenticationCodesImage,
  SyncCloudsImage,
  FallingConfettiImage,
} from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { IllustrationsTheme } from '../PreparedImage';
import Banner from '../Banner';

export default {
  title: 'Components/Images',
  subcomponents: {
    EmailCodeImage,
    HeartsBrokenImage,
    HeartsVerifiedImage,
    LightbulbImage,
    PasswordImage,
    MailImage,
    BackupCodesImage,
    RecoveryKeyImage,
    TwoFactorAuthImage,
    PasswordSuccessImage,
    BackupRecoveryPhoneImage,
    BackupRecoveryPhoneCodeImage,
  },
  decorators: [withLocalization],
} as Meta;

export const EmailCode = () => <EmailCodeImage />;

export const HeartsBroken = () => <HeartsBrokenImage />;

export const HeartsVerified = () => <HeartsVerifiedImage />;

export const Key = () => <RecoveryKeyImage />;

export const Lightbulb = () => <LightbulbImage />;

export const Password = () => <PasswordImage />;

export const Mail = () => <MailImage />;

export const BackupCodes = () => <BackupCodesImage />;

export const TwoFactorAuth = () => <TwoFactorAuthImage />;

export const PasswordSuccess = () => <PasswordSuccessImage />;

export const BackupRecoveryPhone = () => <BackupRecoveryPhoneImage />;

export const BackupRecoveryPhoneCode = () => <BackupRecoveryPhoneCodeImage />;

export const BackupRecoveryPhoneSms = () => <BackupRecoveryPhoneSmsImage />;

export const BackupAuthenticationCodes = () => (
  <BackupAuthenticationCodesImage />
);
export const SyncClouds = () => <SyncCloudsImage />;

export const ConfettiFallingFullPage = () => <FallingConfettiImage />;

const smartWindowTheme: IllustrationsTheme = {
  primary: '#7543e3',
  primaryAlt: '#9168e9',
  secondary: '#c8b2f6',
  accentBg: '#210340',
  accentFg: '#ffffff',
  cloudPrimary: '#e0d0ff',
  cloudShadow: '#000',
  hideClouds: true,
};

const cloudRows: [string, string][] = [
  ['cloudPrimary', 'Cloud fill color'],
  ['cloudShadow', 'Cloud shadow/glow color'],
  ['hideClouds', 'Hide cloud elements if set to true (default is false)'],
];

const GradientNote = () => (
  <Banner
    type="warning"
    content={{
      localizedHeading:
        'Only solid colors are supported. CSS gradients cannot currently be used because they require an XML change inside the SVG.',
    }}
  />
);

// We use inline styles here only because Tailwind class names set in Storybook
// are not included in the CSS output.
const ThemeTable = ({ rows }: { rows: [string, string][] }) => (
  <table style={{ marginTop: 16, fontSize: 13, borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        <th style={{ textAlign: 'left', padding: '4px 12px 4px 0' }}>
          Property
        </th>
        <th style={{ textAlign: 'left', padding: '4px 12px 4px 0' }}>
          Controls
        </th>
      </tr>
    </thead>
    <tbody>
      {rows.map(([prop, desc]) => (
        <tr key={prop}>
          <td style={{ padding: '2px 12px 2px 0' }}>
            <code>{prop}</code>
          </td>
          <td>{desc}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const EmailCodeCMS = {
  name: 'CMS > Email Code (Smart Window theme)',
  render: () => (
    <div>
      <EmailCodeImage illustrationsTheme={smartWindowTheme} />
      <ThemeTable
        rows={[
          ['primary', 'Envelope body'],
          ['primaryAlt', 'Envelope side panels'],
          ['secondary', 'Envelope flap'],
          ['accentBg', 'Code pill background, arrow circle background'],
          ['accentFg', 'Arrow icon (fill & stroke)'],
          ...cloudRows,
        ]}
      />
      <GradientNote />
    </div>
  ),
};

export const EmailCodeCMSWithClouds = {
  name: 'CMS > Email Code (with clouds)',
  render: () => (
    <div>
      <EmailCodeImage
        illustrationsTheme={{
          primary: '#5a2dc7',
          primaryAlt: '#ae49ec',
          secondary: '#ff97e2',
          accentBg: '#210340',
          accentFg: '#fff1f8',
          cloudPrimary: '#fff1f8',
          cloudShadow: '#210340',
        }}
      />
      <ThemeTable
        rows={[
          ['primary', 'Envelope body'],
          ['primaryAlt', 'Envelope side panels'],
          ['secondary', 'Envelope flap'],
          ['accentBg', 'Code pill background, arrow circle background'],
          ['accentFg', 'Arrow icon (fill & stroke)'],
          ...cloudRows,
        ]}
      />
      <GradientNote />
    </div>
  ),
};

export const BackupCodesCMS = {
  name: 'CMS > Backup Codes (Smart Window theme)',
  render: () => (
    <div>
      <BackupCodesImage illustrationsTheme={smartWindowTheme} />
      <ThemeTable
        rows={[
          ['primary', 'Document body'],
          ['secondary', 'Document fold/corner'],
          ['accentBg', 'Bracket circle background'],
          ['accentFg', 'Bracket icons (fill & stroke)'],
          ...cloudRows,
        ]}
      />
      <GradientNote />
    </div>
  ),
};

export const BackupRecoveryPhoneCodeCMS = {
  name: 'CMS > Recovery Phone Code (Smart Window theme)',
  render: () => (
    <div>
      <BackupRecoveryPhoneCodeImage illustrationsTheme={smartWindowTheme} />
      <ThemeTable
        rows={[
          ['primary', 'Phone frame, home bar, lock bottom bar, lock shackle'],
          ['secondary', 'Phone screen, lock top bar, lock body'],
          ['accentBg', 'Lock circle background, keyhole, code dots, asterisks'],
          ['accentFg', '(not used in this illustration)'],
          ...cloudRows,
        ]}
      />
      <GradientNote />
    </div>
  ),
};
