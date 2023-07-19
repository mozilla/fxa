import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExampleHeader from '.';

describe('Example Header', () => {
  it('renders the example header', () => {
    render(<ExampleHeader />);

    const exampleHeader = screen.getByTestId('header');

    expect(exampleHeader).toBeVisible();
  });
});
