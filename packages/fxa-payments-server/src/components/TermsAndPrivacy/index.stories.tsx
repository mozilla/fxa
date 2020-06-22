import React from 'react';
import { storiesOf } from '@storybook/react';
import { TermsAndPrivacy } from './index';
import { defaultAppContext, AppContext } from '../../lib/AppContext';
import { SELECTED_PLAN } from '../../lib/mock-data';

storiesOf('TermsAndPrivacy', module)
  .add('default locale', () => <TermsAndPrivacy plan={SELECTED_PLAN} />)
  .add('with fr locale', () => (
    <AppContext.Provider
      value={{ ...defaultAppContext, navigatorLanguages: ['fr'] }}
    >
      <TermsAndPrivacy plan={SELECTED_PLAN} />
    </AppContext.Provider>
  ));
