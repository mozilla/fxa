# Firefox Accounts Settings

## Table of Contents

[Relevant ADRs](#relevant-adrs)\
[Development](#development)\
[GQL and REST API Calls](#gql-and-rest-api-calls)\
— [Global Application Data](#global-application-data)\
— [GQL error handling](#gql-error-handling)\
[Components to Know](#components-to-know)\
— [`LinkExternal`](#linkexternal)\
— [`AlertBar`](#alertbar-and-alertexternal)\
— [`VerifiedSessionGuard` and `ModalVerifySession`](#sessions-verifiedsessionguard-and-modalverifysession)\
[Styling Components](#styling-components)\
— [Tailwind](#tailwind)\
—— [Component Classes](#component-classes)\
—— [RTL support](#rtl-support)\
— [PurgeCSS](#purgecss)\
— [Custom Styles](#custom-styles)\
[`fxa-react`](#fxa-react)\
— [Reusing Components with `fxa-react` and Tailwind](#reusing-components-with-fxa-react-and-Tailwind)\
[Working with SVGs](#working-with-svgs)\
[Metrics](#metrics)\
— [Payload Data](#payload-data)\
— [Event Logging](#event-logging)\
[Testing and Mocks for Tests/Storybook](#testing-and-mocks-for-testsstorybook)\
— [`AlertBar`](#components-that-use-alertbar)\
— [`useAccount`, `useSession`, or GQL Mocks](#components-that-use-useaccount-usesession-or-need-a-gql-mock)\
— [Mocking mutation errors](#mocking-mutation-errors)\
[Storybook](#storybook)\
[Functional Testing](#functional-testing)\
[License](#license)

## Relevant ADRs

- [Create a New React Application for the Settings Redesign Project](https://github.com/mozilla/fxa/blob/main/docs/adr/0011-create-new-react-app-for-settings-redesign.md)
- [React Toolchain for Settings Redesign](https://github.com/mozilla/fxa/blob/main/docs/adr/0013-react-toolchain-for-settings-redesign.md)
- [Use GraphQL and Apollo for Settings Redesign](https://github.com/mozilla/fxa/blob/main/docs/adr/0016-use-graphql-and-apollo-for-settings-redesign.md)
- [Switch from OAuth2 to Sharing sessionToken with GraphQL Server for Settings Redesign Auth](https://github.com/mozilla/fxa/blob/main/docs/adr/0017-switch-settings-auth-to-sessiontoken.md)
- [Use Utility-First CSS (Tailwind) with Custom SCSS](https://github.com/mozilla/fxa/blob/main/docs/adr/0018-use-tailwind-with-custom-scss.md)
- [Use Existing InternJS for Functional Testing in Settings V2](https://github.com/mozilla/fxa/blob/main/docs/adr/0021-use-internjs-testing.md)

## Development

Note that the fxa-settings code is served by the fxa-content-server. To preview the code locally, visit `http://localhost:3030/beta/settings`, not `http://localhost:3000`.

- `yarn start|stop|restart` to start, stop, and restart the server as a PM2 process
- `yarn build` to create a production build
- `yarn test` to run unit tests
- `yarn storybook` to open Storybook

## GQL and REST API Calls

FxA Settings communicates primarily with the FxA GraphQL API through use of [Apollo Client](https://www.apollographql.com/docs/react/) to indirectly interact with the `fxa-auth-server`. Requests that simply retrieve data are called queries and all other interaction requests are called mutations. See the [GQL documentation](https://graphql.org/learn/) to learn more. See [the documentation for `fxa-graphql-api`](https://github.com/mozilla/fxa/tree/main/packages/fxa-graphql-api) to connect to the playground, a place to view the API docs and schema, and to write and test queries and mutations before using them in a component.

While most API calls can be performed with GQL, there are a few calls that must directly communicate with the auth server (for now) for security reasons. To make REST API calls to the auth server, use the `useAuth` and `useAwait` hooks.

### Global Application Data

This application uses [Apollo client cache](https://www.apollographql.com/docs/react/caching/cache-configuration/) to store app-global state, holding both data received from the GQL server and [local data](https://www.apollographql.com/docs/tutorial/local-state/) that needs to be globally accessible. You can see the shape of this data in the schema found within the `GetInitialState` query, noting that a `@client` directive denotes local data.

Access the client cache data in top-level objects via custom `use` hooks. At the time of writing, `useAccount` and `useSession` (see the "Sessions" section) will allow you to access `data.account` and `data.session` respectively inside components where that data is needed. See the "Testing" section of this doc for how to mock calls.

### GQL error handling

When an error occurs from a query or mutation, the Apollo Client GQL response distinguishes between two kinds of errors on the `error` object - `graphQLErrors`, an array of errors provided by a GQL server-side resolver, and `networkError`, an error that is thrown outside of a resolver. Apollo Server [can throw](https://www.apollographql.com/docs/apollo-server/data/errors/) `AuthenticationError`, `ForbiddenError`, `UserInputError`, or a generic `ApolloError` which Apollo Client stores in `graphQLErrors`. We don’t need to send these to Sentry on the client-side because all errors aside from `UserInputError` are logged by the `fxa-gql-api` package, but a `networkError` should be logged because it means the query was rejected and no data was returned, such as if Apollo Client failed to connect to the GQL endpoint. Learn more about [Apollo error handling](https://www.apollographql.com/docs/react/data/error-handling/).

All errors should be handled. As a general rule of thumb, validation errors from `graphQLErrors` should be displayed the user, while `networkErrors` should report to Sentry.

When performing a GraphQL mutation, use our custom [`useMutation`](./lib/hooks.tsx) hook and set the `onError` property to handle GraphQL Errors (such as validations). The hook will automatically send any network-level errors to Sentry and return `ApolloError` for you to access GQL errors and render them in the UI or an AlertBar.

Example of a mutation with errors appearing in an `AlertBar`:

```tsx
const [destroySession, { data }] = useMutation(DESTROY_SESSION_MUTATION, {
  onError: (error) => {
    // The useAlertBar hook's `error` method can take an ApolloError object
    // and conditionally render GQL errors if they're present, or fall back
    // to the error string you provided.
    alertBar.error('Sorry, there was a problem signing you out.', error);
  },
});
```

Example of a mutation with validation errors appearing in a tooltip, and other errors in an `AlertBar`:

```tsx
const [verifySecondaryEmail] = useMutation(VERIFY_SECONDARY_EMAIL_MUTATION, {
  onError: (error) => {
    // If we receive an GQL error it is related to invalid input, so we'll
    // set it as a state string that is used in a tooltip component.
    if (error.graphQLErrors?.length) {
      setErrorText(error.message);
    } else {
      alertBar.error('There was a problem sending the verification code.');
    }
  },
});
```

See the "Testing" section for mocking mutation errors.

## Components to Know

### `LinkExternal`

When an external link needs to be opened in a new tab, use the `LinkExternal` component. This ensures `rel="noopener noreferrer"` is present on links containing a `target="_blank"` as a precaution against reverse tabnabbing and also provides visually hidden accessible text to inform screenreaders the link will open in a new window.

#### AlertBar

The `AlertBar` is used to display messages to the user, typically for communicating success or error messages back to the user. `<div id="alert-bar-root"></div>` is located just below the layout header and serves as the parent for where this component renders in the DOM via a React [Portal](https://reactjs.org/docs/portals.html) and an `AlertBarContext` which holds a reference to `alert-bar-root`.

The `AlertBar` takes in an optional `type` prop, defaulting to `'success'` if not passed in but can be set to `'error'` or `'info'`, altering the text and background color of the bar. Additionally, the `useAlertBar` hook is available to help maintain state and provide convenience methods for showing alerts.

A basic example for displaying the component:

```jsx
const MyComponent = () => {
  /* `.visible` defaults to `false` unless configured otherwise.
   * The `.show` and `.hide` methods are used to toggle visibility.
   * You'll typically pass `.hide` into `AlertBar` as the `onDismiss` prop.
   */

  const alertBar = useAlertBar();

  return (
    <>
      {alertBar.visible && (
        <AlertBar onDismiss={alertBar.hide}>
          <p>Alert bar text!</p>
        </AlertBar>
      )}
      <div>
        <button onClick={alertBar.show}>Click here to see the AlertBar!</button>
      </div>
    </>
  );
};
```

A more advanced example, using convenience methods, and variable content and type:

```jsx
const MyComponent = () => {
  /* The hook provides `.success`, `.info`, and `.error` convenience methods
   * to help you set content and display the AlertBar of that type.
   * Use `.content` and `.type` to set those properties on the AlertBar.
   */

  const alertBar = useAlertBar();

  return (
    <>
      {alertBar.visible && (
        <AlertBar onDismiss={alertBar.hide} type={alertBar.type}>
          {alertBar.content}
        </AlertBar>
      )}
      <div>
        <button
          onClick={() => {
            alertBar.success('This is a success message.');
          }}
        >
          Click here to a success AlertBar!
        </button>
        <button
          onClick={() => {
            alertBar.error('This is an error message.');
          }}
        >
          Click here to an error AlertBar!
        </button>
      </div>
    </>
  );
};
```

See the "Testing" section for mocking the `AlertBar`.

#### `AlertExternal`

Some actions from the `fxa-content-server` need to display an alert message on the settings page, such as when a user has successfully verified their primary email in the login flow. To display the message across the "app boundary" between the content server and `fxa-settings`, a message is stored in `localStorage` and whichever app sees it first will display the message and then remove it from `localStorage`.

If `fxa-settings` checks `localStorage` first, it stores the string in the reactive variable `alertContent`, displays it in the `AlertBar` and clears the text.

### Sessions, `VerifiedSessionGuard`, and `ModalVerifySession`

Users cannot access the settings page if their primary email is not verified, and in fact they're considered to have an unverified _account_ in this state. Users can, however, access the page with an unverified session - in this context, a verified or unverified session serves as an enhanced verification step. If it's a user's first session, the session will be verified when the user's primary email is verified. If it's a new session, say on another device, the user's session will be invalid until the user requests a verification code that will be sent to their primary email.

A user can't do the following in an unverified session, as determined by an `Unverified session` error from the auth-server:

- Delete their account
- Change their password
- All actions around secondary emails
- All actions around TOTP
- All actions around the recovery key

This means we'll need to guard around any actions allowing these interactions, links to flows for these actions, and flows themselves. We can do this with by wrapping the component containing the action in question with a `VerifiedSessionGuard` that ensures a user's session is verified before displaying the content.

When a user attempts to perform a guarded action in an unverified session state, the `ModalVerifySession` should be presented instead of following through with the action. This modal is returned by `VerifiedSessionGuard` but depending on the component, it can be used standalone.

### Styling components

#### Tailwind

The `fxa-settings`, `fxa-react`, and `fxa-admin-panel` packages are setup to share a [Tailwind CSS](https://tailwindcss.com/) configuration file found in the `fxa-react` package. Other React packages, such as `fxa-payments-server` and `fxa-content-server` will be configured to use Tailwind at a later time. If you're not familiar with Tailwind, look through [their documentation](https://tailwindcss.com/docs) to get an idea of what [utility-first](https://tailwindcss.com/docs/utility-first) (Atomic CSS) is and what you can expect while using it. The general idea is simple: use single-purpose classes on elements to layer styles until the design is achieved. **You can accomplish almost all of your styling needs with classes provided by Tailwind's default configuration or through adding them in the configuration file.**

Each package has its own `tailwind.[s]css` file. This file, any S/CSS files this file imports, and the Tailwind configuration file are compiled to produce `tailwind.out.css`. Rebuilding the SCSS file should happen automatically on any change. If you're not sure what specific class name corresponds with the style you need or if you need to check that a specific style exists in our utility classes, search through `tailwind.out.[s]css` for these styles as needed. Note that if you run a build command to test a production build, you'll need to make an update to one of these files with `pm2` running or manually run `yarn build-postcss` to rebuild the dev version containing all available classes (see the "PurgeCSS" section for more details).

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

##### RTL support

When padding, margin or relative positions are directional (e.g. more padding on the left), we need to consider support for RTL languages (HE, AR, FA).
The [Tailwind Direction plugin](https://github.com/RonMelkhior/tailwindcss-dir) will automatically create a set of new classes
for all directional classes with the `ltr:` and `rtl:` prefixes.

In order to use it properly, we need to use only the prefixed classes, so that instead of the class `ml-3` we should use: `ltr:ml-3 rtl:mr-3`.
This will give a left margin of `0.75rem` on LTR languages and right margin of `0.75rem` on RTL languages.
If the class already has a `{screen}:` prefix, the `ltr:` and `rtl:` prefixes will come after the `{screen}:` part. E.g.: `desktop:ltr:mr-3`.

In some cases, we need to flip icons or other graphics (usually those that contain arrows). In order to do so, we can use the `transform` class,
along with the `rtl:-scale-x-1` to do the flip.

Here is an example that shows the proper use of the above prefixed `ltr:` and `rtl:` classes:

```tsx
// Before (LTR only):
<SignOut
  className="mr-3 desktop:mr-8 inline-block align-middle"
/>

// After (LTR and RTL):
<SignOut
  className="ltr:mr-3 rtl:ml-3 desktop:ltr:mr-8 desktop:rtl:ml-8 inline-block align-middle transform rtl:-scale-x-1"
/>
```

Utility classes present a challenge when it comes to RTL support, because you cannot use `@apply` with pseudo-selector. As a workaround, you need to explicitly create
the RTL/LTR definitions. You can still use the tailwind classes, as shown below:

```scss
// Before (LTR only):
.drop-down-menu::before {
  @apply caret-top absolute -top-3 left-55;
}

// After (LTR and RTL):
.drop-down-menu::before {
  content: '';
  @apply caret-top absolute -top-3;
}
[dir='ltr'] .drop-down-menu::before {
  @apply left-55;
}
[dir='rtl'] .drop-down-menu::before {
  @apply right-55;
}
```

Alternatively, you can utilize the SCSS parent selector (`&`) to generate the same code as above while keeping nesting inside the parent class like so:

```scss
.drop-down-menu {
  &::before {
    content: '';
    @apply caret-top absolute -top-3;
  }

  [dir='ltr'] &::before {
    @apply left-55;
  }
  [dir='rtl'] &::before {
    @apply right-55;
  }
}
```

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

### `fxa-react`

You can import React components externally from `fxa-react` into this project:

```javascript
// e.g. assuming the component HelloWorld exists
import HelloWorld from 'fxa-react/components/HelloWorld';
```

Components from React packages can be moved into `fxa-react` to be shared across multiple packages.

#### Reusing components with `fxa-react` and Tailwind

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

If the inlined SVG is inside of a button, you can forgo the `role` and `aria-label` by preferring a `title` on a button:

```jsx
import { ReactComponent as CloseIcon } from 'fxa-react/images/close.svg';
...
<button
  title="Close"
>
  <CloseIcon />
</button>
```

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

### Metrics

Metrics reports are currently sent to the fxa-content-server metrics endpoint. Use the [metrics library](./src/lib/metrics.ts) to log events and other information.

#### Payload data

Relevant environment and account data, such as window measurements, user locale, and flow data are automatically included in metrics payloads, however additional data can be set as needed:

- `setProperties({ key: value })` can be used to configure additional information about the user's environment and session. Refer to `ConfigurableProperties` in the metrics library for the properties that can be configured.
- `setUserPreference` can be used to log when a user preference is updated.
- `addExperiment(choice, group)` can be used to add details about an experiment the user is participating in.

#### Event logging

Log events to record when a user completes a measurable action. All previously mentioned payload data is included each time one of the following logging functions are called:

- `logViewEvent(viewName, eventName, eventProperties)` can be used to record that a particular view (a "page") was visited.
- `logExperiment(choice, group, eventProperties)` can be used to log the outcome of an experiment the user is participating in. This also calls `addExperiment` with the same choice and group.

All logging methods have the argument `eventProperties`, which can be used to supply event-specific information to the payload.

**Note:** take care when calling these methods as they attempt to log the event immediately. When logging view events inside React Components you'll want to place the call inside a `useEffect` hook to only execute on component render.

## Testing and Mocks for Tests/Storybook

This package uses [Jest](https://jestjs.io/) to test its code. By default `yarn test` will test all JS files under `src/`. Running `yarn test:coverage` will also provide a coverage report, which should be respected.

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

### Components that use `AlertBar`

Because the `AlertBar` renders children into `<div id="alert-bar-root"></div>` located just below the layout header in the DOM in the real application, this element and the reference to it, located in `AlertBarContext`, must be present when running isolated tests. Wrap the test in `AlertBarRootAndContextProvider` for this purpose.

```jsx
const { rerender } = render(<AlertBarRootAndContextProvider />);
rerender(
  <AlertBarRootAndContextProvider>
    <MyComponent />
  </AlertBarRootAndContextProvider>
);
```

A `rerender` is necessary in order to update the component reference in the Context provider. If this is _not_ provided, it will default to using a `Portal` that renders adjacent to the root app `<div id="root"></div>` and an error will show in the console.

### Components that use `useAccount`, `useSession`, or Need a GQL Mock

[MockedCache](./src/models/mocks.tsx) is a convenient way to test components that `useAccount` or `useSession`. Use it in place of [MockedProvider](https://www.apollographql.com/docs/react/api/react/testing/#mockedprovider) without prop overrides to use the default mocked cache, or pass in `account` to override pieces of the default mocked cache and/or `verified` to override the top-level `session.verified` data piece. A `mocks` prop can also be passed in when a query or mutation needs success or failure mocks.

Example:

```jsx
const mocks = [];
<MockedCache
  account={{ avatar: { id: null, url: null } }}
  verified={false}
  {...{ mocks }}
>
  <HeaderLockup />
</MockedCache>;
```

### Mocking mutation errors

Testing for GQL and network errors is also pretty straightforward. In your tests, wrap your component in a [MockedCache](#components-that-use-useaccount-usesession-or-need-a-gql-mock) and provide it with mock mutations that produce either an array of `GraphQLError`s, or a standard `Error`. Example with both:

```tsx
const mocks = [
  {
    request: {
      query: VERIFY_SESSION_MUTATION,
      variables: { input: { code: '12345678' } },
    },
    result: {
      errors: [new GraphQLError('invalid code')],
    },
  },
  {
    request: {
      query: VERIFY_SESSION_MUTATION,
      variables: { input: { code: '87654321' } },
    },
    error: new Error('network error'),
  },
];

renderWithRouter(
  <MockedCache verified={false} {...{ mocks }}>
    <ModalVerifySession {...{ onDismiss, onError }} />
  </MockedCache>
);
```

### Common Errors

##### Lacking Location Provider

```
useLocation hook was used but a LocationContext.Provider was not found in the parent tree. Make sure this is used in a component that is a child of Router
```

```js
.addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
```

##### Lacking Mocked Apollo Provider

```
No Apollo Client instance can be found. Please ensure that you have called `ApolloProvider` higher up in your tree.
```

```js
  .addDecorator((getStory) => (
    <MockedProvider>
      <MockedCache>{getStory()}</MockedCache>
    </MockedProvider>
  ))
```

## Storybook

This project uses [Storybook](https://storybook.js.org/) to show each screen without requiring a full stack.

In local development, `yarn storybook` will start a Storybook server at <http://localhost:6008> with hot module replacement to reflect live changes. Storybook provides a way to document and visually show various component states and application routes. Storybook builds from pull requests and commits can be found at https://storage.googleapis.com/mozilla-storybooks-fxa/index.html.

## Functional Testing

Functional testing for this project requires the entire FxA stack to be running. Check out [Getting Started](https://github.com/mozilla/fxa#getting-started) for more instructions.

Running and adding new functional test for settings is very similar to adding a functional test for the content-server. For an overview of functional testing in content-server check out this [document](https://github.com/mozilla/ecosystem-platform/blob/master/docs/fxa-engineering/functional-testing.md).

### Running tests

```
cd packages/fxa-content-server
node tests/intern.js --suites="settings"
```

#### Single test

```
cd packages/fxa-content-server
node tests/intern.js --suites="settings" --grep="name of test here"
```

### Adding a new test

- Create your test file in [packages/fxa-content-server/tests/functional/settings](https://github.com/mozilla/fxa/tree/main/packages/fxa-content-server/tests/functional/settings_v2)
  - Existing tests are a good starting point
- Add your test to the settings [suite](https://github.com/mozilla/fxa/blob/main/packages/fxa-content-server/tests/functional_settings.js)

## License

MPL-2.0
