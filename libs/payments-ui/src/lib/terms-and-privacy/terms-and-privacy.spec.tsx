import { render } from '@testing-library/react';

import TermsAndPrivacy from './terms-and-privacy';

describe('TermsAndPrivacy', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TermsAndPrivacy />);
    expect(baseElement).toBeTruthy();
  });
});
