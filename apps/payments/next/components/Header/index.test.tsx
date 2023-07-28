import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '.';

describe('Header', () => {
  it('renders the header', () => {
    render(<Header />);

    const globalHeader = screen.getByTestId('header');

    expect(globalHeader).toBeVisible();
  });
});
