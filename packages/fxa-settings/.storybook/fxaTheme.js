import { create } from '@storybook/theming/create';

export default create({
  base: 'light',

  brandTitle: 'Firefox Accounts Storybook',
  brandUrl: 'https://github.com/mozilla/fxa',
  brandImage: './logo.png',

  colorPrimary: '#F3A03F',
  colorSecondary: '#0060DF',

  fontBase:
    'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  fontCode: 'menlo',

  appBg: '#FAFAFB',
  appContentBg: '#fff',
  appBorderRadius: 12,

  inputBg: 'white',
  inputBorder: 'silver',
  inputTextColor: 'black',
  inputBorderRadius: 4,
});
