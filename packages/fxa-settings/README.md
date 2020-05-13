# Firefox Accounts Settings

## Development

- `npm run start|stop|restart` to start, stop, and restart the server as a PM2 process
- `npm run build` to create a production build

**External imports**

You can import React components into this project. This is currently restricted to `fxa-components`:

```javascript
// e.g. assuming the component HelloWorld exists
import HelloWorld from '@fxa-components/HelloWorld';
```

**Working with SVGs**

Create React App allows us to use SVGs in a variety of ways, right out of the box.

```javascript
// Inline, full markup:
import { ReactComponent as Logo } from './logo.svg';
const LogoImage = () => <Logo role="img" aria-label="logo" />;

// As an image source:
import logoUrl from './logo.svg';
const LogoImage = () => <img src={logoUrl} alt="Logo" />;

// As a background-image (inline style)
import logoUrl from './logo.svg';
const LogoImage = () => (
  <div
    style={{ backgroundImage: `url(${logoUrl})` }}
    role="img"
    aria-label="logo"
  ></div>
);

// As a background-image (external style)
// Just reference it in CSS, the loader will find it
// .logo { background-image: url('logo.svg'); }
const LogoImage = () => <div class="logo" role="img" aria-label="logo"></div>;
```

## Testing

This package uses [Jest](https://jestjs.io/) to test its code. By default `npm test` will test all JS files under `src/`.

Test specific tests with the following commands:

```bash
# Test for the component AlertBar
npm run test -- AppLayout

# Grep for "renders as expected"
npm run test -- -t "renders as expected"
```

Refer to Jest's [CLI documentation](https://jestjs.io/docs/en/cli) for more advanced test configuration.

## Storybook

This project uses [Storybook](https://storybook.js.org/) to show each screen without requiring a full stack.

_You will eventually be able to view the built Storybook at <http://mozilla.github.io/fxa/settings>._

In local development, `npm run storybook` should start a Storybook server at <http://localhost:6008> with hot module replacement to reflect live changes.

## Architectural decisions

The FxA team has made intentional decisions when it comes to the design of this package and its related packages' code bases. Learn more in the following ADRs:

- 0009 - [Consistency in testing tools](https://github.com/mozilla/fxa/blob/master/docs/adr/0009-testing-stacks.md)
- 0010 - [Transition FxA from Backbone to React](https://github.com/mozilla/fxa/blob/master/docs/adr/0010-transition-fxa-from-backbone-to-react.md)
- 0011 - [Create a New React Application for the Settings Redesign Project](https://github.com/mozilla/fxa/blob/master/docs/adr/0011-create-new-react-app-for-settings-redesign.md)
- 0013 - [React Toolchain for Settings Redesign](https://github.com/mozilla/fxa/blob/master/docs/adr/0013-react-toolchain-for-settings-redesign.md)
- 0014 - [Authentication in Settings Redesign](https://github.com/mozilla/fxa/blob/master/docs/adr/0014-auth-for-settings-redesign.md)

## License

MPL-2.0
