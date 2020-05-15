# Firefox Accounts Settings

## Development

- `npm run start|stop|restart` to start, stop, and restart the server as a PM2 process
- `npm run build` to create a production build

### External imports

You can import React components into this project. This is currently restricted to `fxa-react`:

```javascript
// e.g. assuming the component HelloWorld exists
import HelloWorld from '@fxa-react/components/HelloWorld';
```

### Styling components

#### Tailwind

The package uses [Tailwind CSS](https://tailwindcss.com/) for the bulk of its styles. If you're not familiar you're encouraged to [learn more](https://tailwindcss.com/docs/utility-first), but the idea is simple: use predefined classes on elements to layer on individual styles. **You can accomplish most of your styling needs with the classes provided.**

For example, here's what a large, centered, red-text paragraph with a blue background and thick padding would look like:

```html
<p class="text-lg text-red-600 background-white text-center p-10">
  Hello, world!
</p>
```

It's fairly straightforward once you understand how size, scales and other sequential patterns work. The [Tailwind docs](https://tailwindcss.com/docs) are very helpful in understanding these concepts (and they have an excellent search), and there are plugins for various IDEs ([VS Code](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss), [IntelliJ IDEs](https://plugins.jetbrains.com/plugin/12074-tailwindcss), [Vim](https://github.com/iamcco/coc-tailwindcss)).

Here are a few additional things to keep in mind when developing with Tailwind:

- We overwrite some of the default values provided by Tailwind, such as color and breakpoints. Refer to [tailwind.config.js](./tailwind.config.js) to see how values vary.
- You do not need to import any custom or built-in styles/dependencies to use Tailwind. Just write your class names.
- When it comes to time to create a production build we use PostCSS and PurgeCSS to strip out unused styles. PurgeCSS will look through all of the TSX files and identify which class names to keep styles for. In order for this to work properly it's important to avoid dynamic class names:

  ```tsx
  // Bad
  const Button = ({ textColor, children }) => {
    return <button className={`text-${textColor}`}>{children}</button>;
  };
  <Button textColor="green-500">Hello, world</Button>;

  // Good!
  const Button = ({ textColor, children }) => {
    return <button className={textColor}>{children}</button>;
  };
  <Button textColor="text-green-500">Hello, world</Button>;
  ```

- If you find a class name is getting stripped out erroneously in production builds, it can be [whitelisted](https://purgecss.com/whitelisting.html) in [tailwind.config.js](./tailwind.config.js) or in the stylesheet itself by placing `/* purgecss ignore */` directly above the selector. Please use sparingly.

#### Custom styles

In the event you need to write styles that Tailwind is not able to affectively cover you should try to keep the following guidelines in mind:

- SCSS is available.
- PurgeCSS does not currently strip styles written outside of `src/styles/tailwind.css`, so it's up to you to keep styles limited to what you're using in your component.
- Custom styles should be restricted to the component they are being used in. Typically, this is just an `index.scss` file adjacent to your component's `index.tsx` and then imported.
- Because custom styles, once imported, are included in the global styles you should still be careful about how you're naming classes to avoid collisions. Generally you should match the class name to the name of your component. If you're using a shared component it's recommended to use `[component]-[descriptor]` style (e.g. using a shared UnitRow to display secondary emails could be `unit-row-secondary-emails`).

### Working with SVGs

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

## License

MPL-2.0
