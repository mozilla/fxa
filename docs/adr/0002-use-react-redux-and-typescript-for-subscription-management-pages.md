# Use React, Redux, and Typescript for subscription management pages

* Deciders: Ben Bangert, Ian Bicking, Les Orchard
* Date: 2019-05-08

## Context and Problem Statement

A solution for isolating third-party payment widgets from the rest of account
management can include building a separate web app on its own dedicated domain.
As a side effect in building that app, we have the opportunity to choose
technologies for building it that don't necessarily follow the rest of FxA.

## Decision Drivers

* Opportunity for a fresh start with tech stack without rewriting
* Security in dealing with payment transactions
* Developer ergonomics
* Code quality & testing
* Subscription services deadlines

## Considered Options

* React, Redux, Typescript
* Backbone.js

## Decision Outcome

Chosen option: "React, Redux, Typescript", because

* Chance to start with a fresh stack
* More vibrant ecosystem
* Better tooling & developer ergonomics

## Pros and Cons of the Options

### React, Redux, TypeScript

[React][] is a library for building DOM-based UI components in a data-driven,
declarative style that minimizes granular DOM manipulation by developers by way
of a Virtual DOM diff / patch algorithm. It also introduces patterns & tools for
encapsulating reusable UI functionality in "hooks" and JS classes.

[React]: https://reactjs.org/

[Redux][] is a library for managing app state in a singleton container using a
defined inventory of actions that describe changes to be applied via reducer
functions and middleware filters.

[Redux]: https://redux.js.org/

[TypeScript][] is a superset of JavaScript which introduces type annotation
expressions and type inference along with tooling to lint and compile.

[TypeScript]: https://www.typescriptlang.org/

We can also consider other dependencies that act as glue between these pieces
and utilities to reduce boilerplate and repetition. (e.g. [redux-actions][] to
simplify constructing actions; [redux-promise-middleware][] for actions that
result in async API fetches; [redux-thunk][] for producing action sequences)

[redux-actions]: https://redux-actions.js.org/ 

[redux-promise-middleware]:
https://github.com/pburtchaell/redux-promise-middleware 

[redux-thunk]: https://github.com/reduxjs/redux-thunk

* Pros
  * Frequently updated and vibrant ecosystem
  * New team members may be more familiar with the React / Redux / TypeScript
    ecosystem
  * React integrates well with Webpack for code-splitting and lazy-loaded
    component JS bundles
  * React and Webpack can support per-component hot reloading rather than
    reloading the whole page
  * React can organize UI rendering into small components with single
    responsibility for each
  * React hooks can be used to encapsulate reusable chunks of UI logic & state
    between components
  * React offers [safeguards][react-innerhtml] against accidental XSS from
    unescaped HTML.
  * Redux can organize business logic and API requests in a central set of
    modules
  * Data-driven React components can be loosely-coupled with Redux state
  * The Redux dev tools browser add-on can monitor, inspect, and even rewind app
    state changes
  * TypeScript can help document & validate data structures at build time (e.g.
    in Redux state) and integrate with IDEs (e.g. intellisense hints in VS Code)
  * Can follow the Mocha / Chai / Sinon style unit testing stack used elsewhere
    in the project
  * Can use [React bindings][fluent-react] for [fluent.js][fluent] and [FTL][]
    strings for L10n.
* Cons
  * Novel technology stack for the project in general.
  * Fast-moving tech stack that may need chasing after.
  * Reduced code sharing with the rest of the project, reinventing some wheels.
  * Fluent is a research project by Mozilla, [it has occasionally presented
    challenges][fluent-challenges].
  
[fluent]: https://projectfluent.org/
[fluent-react]: https://github.com/projectfluent/fluent.js/wiki/React-Bindings
[ftl]: https://projectfluent.org/fluent/guide/
[fluent-challenges]: https://github.com/mozilla/testpilot/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aclosed+fluent
[react-innerhtml]: https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml

### Backbone.js

[Backbone.js][] is small framework that offers base View and Model abstractions.

[Backbone.js]: https://backbonejs.org/

FxA combines it with a few other utilities including [Mustache][] for HTML
templates; [Cocktail][] for class mixins; [jQuery][] for DOM manipulation.
Depends on [Underscore.js][] for general data manipulation.

[Mustache]: https://mustache.github.io/ 

[Cocktail]: https://github.com/onsi/cocktail

[jQuery]: https://jquery.com/

[Underscore.js]: https://underscorejs.org/

* Pros
  * Framework of record for client-side code in FxA so far.
  * Granular DOM updates in View classes do not rely on an abstract Virtual DOM
    that can have an impact on performance.
  * Pretty small framework, even with the added utilities.
  * Mature framework that doesn't need much chasing after.
  * Lots of mature tested code within FxA to reuse and on which to model new
    additions.
  * Uses [mature gettext tools & processes for L10n][fxa-l10n].
  * Mustache and Backbone best practices help guard against XSS via unescaped HTML.
* Cons
  * New team members may not be familiar with Backbone patterns
  * Updating Views requires granular DOM changes that can sometime collide
    between different Views that affect the same parts of the DOM - i.e
    overlapping responsibilities.
  * Business logic can be scattered amongst separate Model classes.
  * Infrequent releases: v1.4.0 released on 2019-02, but v1.3.3 released on
    2016-04.
  * fxa-content-server uses v1.1.1 from 2014-02 along with similarly-aged
    versions of Cocktail and Mustache.
  * Fluent [was created][fluent-created] to address issues [found over years of using
    gettext][fluent-v-gettext] at Mozilla.

[fxa-l10n]: https://github.com/mozilla/fxa-content-server-l10n/
[fluent-created]: https://hacks.mozilla.org/2019/04/fluent-1-0-a-localization-system-for-natural-sounding-translations/
[fluent-v-gettext]: https://github.com/projectfluent/fluent/wiki/Fluent-vs-gettext