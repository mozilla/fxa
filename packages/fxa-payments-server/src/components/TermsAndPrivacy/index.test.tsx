import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { TermsAndPrivacy } from './index';

afterEach(cleanup);

it('renders as expected', () => {
  const { queryByTestId } = render(<TermsAndPrivacy />);
  expect(queryByTestId('terms')).toBeInTheDocument();
  expect(queryByTestId('privacy')).toBeInTheDocument();
});
