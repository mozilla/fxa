import { render } from '@testing-library/react';

import PaymentsUi from './payments-ui';

describe('PaymentsUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PaymentsUi />);
    expect(baseElement).toBeTruthy();
  });
});
