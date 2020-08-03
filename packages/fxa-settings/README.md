# Firefox Accounts Settings

This documentation is up to date as of 2020-08-03.

## Development

- `yarn start|stop|restart` to start, stop, and restart the server as a PM2 process
- `yarn build` to create a production build
- `yarn test` to run unit tests
- `yarn storybook` to open Storybook

### Styling components

#### Tailwind

The `fxa-settings`, `fxa-react`, and `fxa-admin-panel` packages are setup to share a [Tailwind CSS](https://tailwindcss.com/) configuration file found in the `fxa-react` package. Other React packages, such as `fxa-payments-server` and `fxa-content-server` will be configured to use Tailwind at a later time. If you're not familiar with Tailwind, look through [their documentation](https://tailwindcss.com/docs) to get an idea of what [utility-first](https://tailwindcss.com/docs/utility-first) (Atomic CSS) is and what you can expect while using it. The general idea is simple: use single-purpose classes on elements to layer styles until the design is achieved. **You can accomplish almost all of your styling needs with classes provided by Tailwind's default configuration or through adding them in the configuration file.**

Each package has its own `tailwind.[s]css` file. This file, any S/CSS files this file imports, and the Tailwind configuration file are compiled to produce `tailwind.out.css`. Rebuilding this file should happen automatically on any change. If you're not sure what specific class name corresponds with the style you need or if you need to check that a specific style exists in our utility classes, search through `tailwind.out.css` for these styles as needed. Note that if you run a build command to test a production build, you'll need to make an update to one of these files with `pm2` running or manually run `yarn build-postcss` to rebuild the dev version containing all available classes (see the "PurgeCSS" section for more details).

**FxA has a design guide available** in Storybook to help alleviate much of the burden around finding the correct class name to use as well as some of the mental math involved explained below. Run `yarn storybook` in this package to pull it up and see the "Storybook" section for more information on Storybook.

Not every spacing value from a design hand off may be absolutely precise due to small variations from web tool processing (such as Sketch conversion to InVision or Figma) - it's important to keep in mind that our CSS system for FxA styles increase in **units of `4px`**. If a design reflects 17px, it's generally safe to go with the closest value divisible by 4, 16px (which is equivalent to `1rem`), but it is up to the engineer to ask for clarification from visual design if this might be an intended one-off and to also potentially offer a strong recommendation to stay within our standard guidelines if a design strays from the `4px` increment standard for the sake of consistency across our products. If an exception needs to be made or if the [Tailwind default configuration](https://tailwindcss.com/docs/configuration) doesn't offer a needed value (for example, [default spacing](https://tailwindcss.com/docs/customizing-spacing#default-spacing-scale) uses `-8` to output `2rem` measurements and `-10` to output `2.5rem`, but if we need `2.25rem`, it's completely acceptable to need `-9`), use the `extends` option in the configuration file to add the class that you need. This also applies with colors and font-sizes - don't arbitrarily add these values without ensuring current values won't work for what Design intends or without conveying to them that it's different than what we've used so far.

We do overwrite some of the default values provided by Tailwind, such as colors and breakpoints. Refer to the shared Tailwind config file to see how values vary.

Here's an example of what a large, centered, red-text paragraph with a blue background and thick padding would look like:

```html
<p class="text-lg text-red-600 background-white text-center p-10">
  Hello, world!
</p>
```

The Tailwind pattern becomes straightforward once you understand how size, scales and other sequential patterns work. The Tailwind docs are very helpful in understanding these concepts (and they have an excellent search), and there are plugins for various IDEs ([VS Code](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss), [IntelliJ IDEs](https://plugins.jetbrains.com/plugin/12074-tailwindcss), [Vim](https://github.com/iamcco/coc-tailwindcss)).

##### Component Classes

When there is a pattern of commonly repeated utility combinations, it may make sense to extract this pattern into its own component or component utility class using Tailwind's `@apply`. A good rule of thumb for this is to consider if a pattern update would be expected to reflect in more than one component.

For example:

```tsx
// my-component.tsx
<button className="block w-full py-2 text-center mt-6 bg-grey-10 border border-grey-200 transition duration-150 rounded hover:border-grey-200 hover:bg-grey-100 hover:text-grey-400 hover:transition hover:duration-150 active:border-grey-400 active:bg-grey-100 active:text-grey-400 active:transition active:duration-150">
  Click here!
</button>

// my-other-component.tsx
<a href="#" className="block w-full py-2 text-center mt-6 bg-grey-10 border border-grey-200 transition duration-150 rounded hover:border-grey-200 hover:bg-grey-100 hover:text-grey-400 hover:transition hover:duration-150 active:border-grey-400 active:bg-grey-100 active:text-grey-400 active:transition active:duration-150">
  Click here!
</a>
```

This makes more sense as a new utility class instead of a component because sometimes we style a button and other times a link. Let's extract this instead into `ctas.scss` with a fitting name:

```scss
// ctas.scss
.cta-neutral {
  @apply block w-full py-2 text-center mt-6 bg-grey-10 border border-grey-200 transition duration-150 rounded;

  &:hover {
    @apply border-grey-200 bg-grey-100 text-grey-400 transition duration-150;
  }

  &:active {
    @apply border-grey-400 bg-grey-100 text-grey-400 transition duration-150;
  }
}
```

Assuming this package uses `postcss-import`, all we need to do now is `@import ./ctas.scss` into our `tailwind.css` file and apply our new utility class:

```tsx
// my-component.tsx
<button className="cta-neutral">
  Click here!
</button>

// my-other-component.tsx
<a href="#" className="cta-neutral">
  Click here!
</a>
```

Note that the above doesn't have to be in an external SCSS file, `@apply` and other PostCSS at-rules can be used in `.css` files, but SCSS still comes in handy for nesting.

Keep in mind that custom component classes are not scoped per component and some line of thought should go into custom class names to avoid naming collisions. Generally, you should match the class name to the name of your component and it's recommended to use `[component]-[descriptor]` style (e.g. using a shared UnitRow to display secondary emails could be `unit-row-secondary-emails`). Also, use `@apply` exclusively if possible, keep the selector one level deep, never use `!important` to avoid specificity collisions, and don't use `&-` overzealously as it makes classes difficult to search for (one level deep is fine). These recommendations generally also apply to custom styles.

See the [Tailwind docs on this subject](https://tailwindcss.com/docs/extracting-components/) for more detailed information and examples.

#### PurgeCSS

When it comes to time to create a production build we use PostCSS and PurgeCSS to strip out unused styles. PurgeCSS will look through all of the TSX files, including those of externally imported components, and identify which class names to keep styles for. In order for this to work properly it's important to avoid dynamic class names:

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

If you find a class name is getting stripped out erroneously in production builds, it can be [whitelisted](https://purgecss.com/whitelisting.html) in [tailwind.config.js](./tailwind.config.js) or in the stylesheet itself by placing `/* purgecss ignore */` directly above the selector. Please use sparingly.

#### Custom styles

In the event you need to write styles that Tailwind is not able to affectively cover you should try to keep the following guidelines in mind:

- SCSS is available if it's absolutely necessary to add a custom style.
- Because PostCSS syntax cannot be directly loaded into a React component (`import './index.scss'`), custom stylesheets must be `@import`ed directly into a `tailwind.[s]css` file or another file that is imported into this file. Add these custom stylesheets in the `styles/` directory.
- Imported custom styles are not scoped per component and some line of thought should go into custom class names to avoid naming collisions. Generally, you should match the class name to the name of your component and it's recommended to use a `[component]-[descriptor]` style (e.g. using a shared UnitRow to display secondary emails could be `unit-row-secondary-emails`). Also, if possible, keep the selector one to two levels deep, never use `!important` to avoid specificity collisions, and don't use `&-` overzealously as it makes classes difficult to search for (one level deep is fine). These recommendations also generally apply to custom component utility classes.

### External imports

You can import React components externally from `fxa-react` into this project:

```javascript
// e.g. assuming the component HelloWorld exists
import HelloWorld from 'fxa-react/components/HelloWorld';
```

Components from React packages can be moved into `fxa-react` to be shared across multiple packages.

### Reusing components with `fxa-react` and Tailwind

Let's say there's a component in `fxa-admin-panel` that you also want to use in `fxa-settings`. You move this component into `fxa-react` to use it in both `fxa-admin-panel` and `fxa-settings` and style it with Tailwind classes:

```tsx
// fxa-react/components/MySharedComponent

const MySharedComponent = () => <div className="font-bold mr-2">Some text</div>;
export default MySharedComponent;
```

Now you can use `MySharedComponent` with the same styles in two packages. You can use it like so:

```tsx
// fxa-settings/src/components/anotherComponent
import MySharedComponent from 'fxa-react/components/MySharedComponent';

<MySharedComponent />;
```

What if you need to reuse this component later with different styles but the component has been used in several places with the classes `font-bold mr-2`? In this case, the component must be refactored to take in a `className` prop with a default set to whatever it was previously. This applies to children as well - you'll have to use `headerClassName` or `contentClassName` (or a `classes` object) or whatever prop name makes sense if any of the children need a different class. Now `MySharedComponent` becomes:

```tsx
// fxa-react/components/MySharedComponent
const MySharedComponent = ({ className = 'font-bold mr-2' }) => (
  <div {...{ className }}>Some text</div>
);
export default MySharedComponent;
```

Then, you can use it with custom classes like so:

```tsx
// fxa-settings/src/components/anotherComponent
import MySharedComponent from 'fxa-react/components/MySharedComponent';

<MySharedComponent className="mr-4" />;
```

All previous instances will still use `font-bold mr-2`.

### Working with SVGs

Create React App allows us to use SVGs in a variety of ways, right out of the box. We prefer to inline our SVGs where we can:

```javascript
// Inline, full markup:
import { ReactComponent as Logo } from './logo.svg';
const LogoImage = () => <Logo role="img" aria-label="logo" />;
```

Inlining our SVGs will minimize the number of network requests our application needs to perform. `role="img"` tells screenreaders to refer to this element as an image and `aria-label` acts like `alt` text on an `img` tag does. You can also pass in `className` and other properties, and if needed, conditionally change elements inside of the SVG such as a `path`'s `fill` property.

Other ways to use SVGs:

```javascript
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

This package uses [Jest](https://jestjs.io/) to test its code. By default `yarn test` will test all JS files under `src/`.

Test specific tests with the following commands:

```bash
# Test for the component AppLayout
yarn test AppLayout

# Grep for "renders as expected"
yarn test -t="renders as expected"
```

You can also see the test coverage with details by running the following command:
```
CI=yes yarn test --coverage --verbose
```

Refer to Jest's [CLI documentation](https://jestjs.io/docs/en/cli) for more advanced test configuration.

## Storybook

This project uses [Storybook](https://storybook.js.org/) to show each screen without requiring a full stack.

In local development, `yarn storybook` will start a Storybook server at <http://localhost:6008> with hot module replacement to reflect live changes. Storybook provides a way to document and visually show various component states and application routes. Storybook builds from pull requests and commits can be found at https://mozilla-fxa.github.io/storybooks/.

## GQL

This package consumes the [FxA GraphQL API](https://github.com/mozilla/fxa/tree/main/packages/fxa-graphql-api). See the documentation to connect to the playground to view the API docs and schema.

## License

MPL-2.0
