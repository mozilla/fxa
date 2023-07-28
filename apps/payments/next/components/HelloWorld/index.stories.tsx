import { Meta } from '@storybook/react';
import HelloWorld from '.';

export default {
  title: 'components/HelloWorld',
  component: HelloWorld,
} as Meta;

export const Default = () => {
  return <HelloWorld />;
};

export const Accessible = () => <button>Accessible button</button>;

export const Inaccessible = () => (
  <button style={{ backgroundColor: 'red', color: 'darkRed' }}>
    Inaccessible button
  </button>
);
