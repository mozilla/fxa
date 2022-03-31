/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/html';
import { storyWithProps } from '../../storybook-email';
import { MOCK_USER_INFO_TRUNCATED } from '../userInfo/mocks';
import {
  MOCK_LOCATION_ALL,
  MOCK_LOCATION_CITY_COUNTRY,
  MOCK_LOCATION_COUNTRY,
  MOCK_LOCATION_STATE_COUNTRY,
} from './mocks';

export default {
  title: 'Stateful partials/userInfo/userLocation',
} as Meta;

const createStory = storyWithProps(
  '_storybook',
  'The location partial within userInfo, with various states depending on where the user is located and what data is available.',
  {
    subject: 'N/A',
    partial: 'userInfo',
    layout: null,
    ...MOCK_USER_INFO_TRUNCATED,
  }
);

export const LocationAll = createStory(
  {
    location: MOCK_LOCATION_ALL,
  },
  'All location details: city, state code, and country'
);

export const LocationDetailsCityCountry = createStory(
  {
    location: MOCK_LOCATION_CITY_COUNTRY,
  },
  'Some location details: city and country'
);

export const LocationDetailsStateCountry = createStory(
  {
    location: MOCK_LOCATION_STATE_COUNTRY,
  },
  'Some location details: state and country'
);

export const LocationDetailsCountry = createStory(
  {
    location: MOCK_LOCATION_COUNTRY,
  },
  'Basic location detail: country'
);
