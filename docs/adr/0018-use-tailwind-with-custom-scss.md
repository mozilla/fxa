# Use Utility-First CSS (Tailwind) with Custom SCSS

- Status: proposed
- Deciders: Jody Heavener, Lauren Zugai, Danny Coates
- Date: 2020-05-08

## Context and Problem Statement

The [Settings Redesign project](https://github.com/mozilla/fxa/issues/3740) provides us with an opportunity to review how FxA approaches and employs CSS, both while building out new components for this project and for FxA going forward.

Historically, the Firefox Accounts codebase has not adhered to a formal CSS structure. This ADR serves to determine how we'll approach our CSS architecture in the Settings Redesign project, evaluating libraries and frameworks to determine which if any will be the best option for the FxA ecosystem. It is part 2 of two [Settings Redesign CSS ADRs](https://github.com/mozilla/fxa/issues/5087); part 1, detailing how we'll approach build conventions and variables, [can be found here](https://github.com/mozilla/fxa/blob/master/docs/adr/0015-use-css-variables-and-scss.md).

Considerations around class naming conventions, color and measurement standards, interoperability across shared components, and custom configuration options offered by each library to meet Settings Redesign design standards are taken into account. Notably, the new design uses space measurements in increments of 8px and [colors](https://protocol.mozilla.org/fundamentals/color.html) are based in Mozilla Protocol's design system, where a hue's brightness scales in increments of 10.

## Decision Drivers

- **Reusability** - does the approach yield DRY, lean code that can be reused and repurposed?
- **Longevity** - will the approach be supported in upcoming years and will it provide a stable platform for years of revolving HTML through added features and bug fixes?
- **Developer experience** - are some team members already familiar with the approach, making the transition easier than an unfamiliar one?
- **Ease of use** - will the choice result in a large learning curve or be easy for engineers to pick up?

## Considered Options

- Option A - Use an existing UI library
- Option B - Use an existing utility library
- Option C - Develop our own hybrid component and utility library
- Option D - Custom SCSS with loose structure

## Decision Outcome

Chosen options: "Option B" with Tailwind CSS for majority styling, and implementation details from "Option D" when utility classes don't meet the entire need, because:

- Of the options set forth, a utility library provides us with the most flexible yet durable set of tools.
  - Single-purpose classes are performant and reduce the possibility of overly-complex or convoluted stylesheets.
  - A utility library is leaner and less opinionated compared to a set of UI components and other options, allowing greater flexibility and reusability across various projects.
- Our team has prior experience with Tailwind in particular and newcomers should ramp up quickly with a utility pattern.
- Tailwind is highly configurable without being cumbersome, allowing us to modify type and spacing scales, define color ranges, and set up media queries to meet our exact needs.
- For cases when we do need to write custom SCSS we will structure our React components to initially rely on utility classes, but allow additional custom styles to be written in an adjacent SCSS file when needed. This is also applicable to components in `fxa-components` where the component can accept a `classes` prop with a list of needed utility classes, and any additional styling can be done in an external SCSS file located where the component was composed as needed (e.g., outside of `fxa-components`). CSS variables can be shared across the Tailwind configuration and in custom SCSS.
  - Note: class name conventions for the custom SCSS will be declared when the library configuration is setup, as we'd like them to make sense together. Examples will be provided in the `fxa-settings` README at this time as well.

## Pros and Cons of the Options

### Option A - Use an existing UI library

Use an existing third-party UI library that provides prebuilt components such as cards, form elements, loaders, various grid and section layouts, and modals, which we would then adjust to suit the needs of our design.

This could include generally "full purpose" UI libraries such as [Semantic UI](https://semantic-ui.com/), [Tailwind UI](https://tailwindui.com/), [Bootstrap](https://getbootstrap.com/), [Bulma](https://bulma.io/), or [Pure.css](https://purecss.io/) designed to cover a wide variety of needs. These libraries follow various CSS architecture patterns or their own custom approach.

Pros:

- A lot of the work is done for us; less time spent creating custom styles.
- Certain libraries provide us with the option to configure base styles and integrate with our build system.
- Most have drop in React subsets that would allow us to utilize UI styling and corresponding markup as proper React components.
- Most come with SASS/SCSS files to allow for configuration.

Cons:

- Won’t cover 100% of our design needs and possibly even less so than other options, which would lead to us needing to create custom styles or classes from scratch or _also_ use a utility library.
- Likely has the highest learning curve out of all considered options. This would require developers to know what already exists for use, likely causing constant documentation checks or searching for what’s available. An IDE extension could possibly ease this burden slightly, depending on the popularity of the chosen library.
- Libraries like Bootstrap are much heavier than other options. They'll almost certainly come with features/components that we will not make use of, though this could possibly be alleviated with a tool like PurgeCSS.
- As some of these libraries include JavaScript to make components fully functional (e.g. accordions, tabs) we would likely need to have the security team vet the chosen option.
- Introduces at least one more dependency to our stack. In fact, because some components would be shared and some would be project-specific it's likely that this dependency would exist in multiple areas of the repo. Even more dependencies would be required if we opt to use custom React components provided by the library due to needing to install corresponding TypeScript definitions. Relying on a third-party dependency for such a large portion of the visible product could be tricky:
  - CVEs and other critical updates rely on the dependency owners to release patches, lest we want to fork and do it ourselves. This is less of a concern with the libraries we are considering as they have reasonably large backings.
  - Dependencies could introduce breaking changes, both with implementation and with how individual UI components work with our custom styles. If any of these libraries provides React libraries we run the same risk with those as well.

### Option B - Use an existing utility library

Use an existing third-party utility library that provides single-purpose classes that can be combined to incrementally style an element.

This option includes libraries that follow the atomic CSS design pattern such as [Tailwind](https://tailwindcss.com/), [Tachyons](http://tachyons.io/), and [Basscss](https://basscss.com/).

Pros:

- Provides us with single-purpose class names for most conceivable CSS styles that we can apply as needed to an element in order to build up its styles. This promotes consistency with some constraints.
- This option is leaner, less opinionated, more performant, and more flexible than option A.
- Because it removes the traditional descriptive class name in favor of style-specific class names, competing and deeply-nested selectors are not of concern.
- Reduction of mental overhead and improved development speed.
- Using a utility-based approach makes sharing components in `fxa-components` straightforward. They can accept a `classes` prop passed in from where the component is composed with the utility classes needed passed in, and any additional styling can be done in an external SCSS file where the component was composed as needed.

Cons:

- Much like Option A this approach would also require our developers to have some knowledge of what's available to them, such as each style's corresponding class name, though this is less of a concern because generally each CSS property is mapped to a class name, and is aided by following size and unit patterns across class names. An IDE extension could be used as well to help in development.
- Generally, each individual style is applied by a single class, so for a highly-styled element it can lead to a set of long, unwieldy class names.
  - E.g. Tachyons: `bg-white black-70 ph3 ph5-ns pv5 pv6-ns bt b--black-10`
  - E.g. Tailwind: `shadow-lg code-white text-sm font-mono subpixel-antialiased bg-gray-800 px-5 pb-6 pt-4 rounded-lg leading-normal overflow-hidden`
  - E.g. Basscss: `h6 caps bold inline-block py1 color-inherit text-decoration-none hover-underline`
- Introduces at least one more dependency to our stack. In fact, because some components would be shared and some would be project-specific it's likely that this dependency would exist in multiple areas of the repo. Relying on a third-party dependency for such a large portion of the visible product could be tricky:
  - CVEs and other critical updates rely on the dependency owners to release patches, lest we want to fork and do it ourselves. This is less of a concern with the libraries we are considering as they have reasonably large backings.
  - Dependencies could introduce breaking changes. This is less likely to occur with a CSS utility library that already has most properties mapped to classes, where new properties would typically yield new classes instead of changes to existing ones.

Out of the utility library options, the team has reached a consensus that Tailwind would be the best option for FxA, which has several pros over other options:

- While most libraries offer some level of configuration, many require working in SASS to override variables and maps, and the resulting output may not always be predictable. Additionally, SASS-level configuration forces us to use SASS variables, and yet in [CSS ADR part 1](https://github.com/mozilla/fxa/blob/master/docs/adr/0015-use-css-variables-and-scss.md), we determined we would like to avoid SASS variables in favor of CSS variables. Tailwind mitigates these inconveniences by offering a root-level JS configuration file which is a better option for organization, clarity, and ease-of-use. Furthermore, Tailwind's configuration options are vast and allow us to set our own incremental spacing, custom font-sizes, determine class name conventions, set custom breakpoints, etc. as we see fit to align with the Settings Redesign visual designs.
- We can use CSS variables to share stored values with any additional custom SCSS when applicable and for future theming options.
- Several engineers on our team have prior experience with Tailwind and like it.
- As of writing, Tailwind is significantly more popular than our other considered options, with nearly 10x the number of downloads (274k) and more than 2x the number of GitHub stars (22k) than its closest competitor Tachyons. This data was gathered from [npm trends](https://www.npmtrends.com/tachyons-vs-tailwindcss-vs-basscss).
- At least one other Mozilla product, Firefox Send, uses Tailwind.

### Option C - Develop our own hybrid UI and utility library

Develop a purpose-built CSS library containing a handful of utility classes and UI components we know we'll be using within our project, while writing custom CSS as needed and adding to the library as our needs grow.

Pros:

- Allows us to tailor a set of styles to suit our project's needs. We can create UI components and helper classes that match, to the exact pixel, what is set out in designs, leaving out any cruft that an existing library would otherwise be packaged with our project.
- Gives us the best of both worlds; allows us to decide our class name conventions, such as ACSS, BEM, OOCSS, etc. while considering purpose-built UI components where suitable and lightweight utility classes where an entire component is not needed.
- No additional third-party dependencies added to the stack.
- Core maintainers would likely have a deeper understanding of the library and would be more capable of performing updates across FxA, compared to a third-party library.

Cons:

- Requires us to set aside time specifically for creating the initial set of styles.
- Requires developers to become familiar with an entirely new library; that is to say, there is zero chance of prior experience with it.
- Upkeep and maintenance could be burdensome with a set of shared custom styles:
  - Developers of new styles would need to decide whether or not what they're developing should be added to the library or kept as a one-off style.
  - The library that is created to suit the needs of one project, in this case the Settings Redesign, may not be suitable for other or future FxA projects, requiring us to go in and either refactor what's already written, or write new styles.

### Option D - Custom SCSS with loose structure

The "style-as-we-go" approach, where styles are generally written as needed for one-time use, possibly following a class name convention, but no formal library or framework is employed. This is what we're currently doing in FxA.

Pros:

- Little to no immediate setup requirements.
- Out of gate, styles are tailored to suit the project's exact needs and we would be free to make decisions as we see fit.
- Even with a "loose" structure, conventions can be set on class names and SCSS organization.
- There would be no learning curve as engineers wouldn't need implementation knowledge prior to development, only SCSS knowledge.
- No additional third-party dependencies added to the stack.

Cons:

- As our code matures, features are added, bugs are fixed, and other changes are layered in there is a likelihood that, without a formal approach, our stylesheets will become convoluted and harder to maintain as time goes on.
  - A lack of convention can lead to unwieldy selector depth, competing rule sets/use of `!important`, a lack of DRY code, inconsistent naming and styling, hard-to-manage SASS `@extends`, and poor readability.
  - The result of this could mean another refactoring of styles sooner than it might occur with other options.
- Unless borrowing from existing styles or inheriting parent styles, all or almost all styles need to be written from scratch, slowing down development.
- While PR reviews may go faster because reviewers don’t have to look out for custom SCSS code that should instead be a library-specific class, the absence of structure can make PR reviews more difficult to vet for best CSS practices and consistency of styles across FxA.
- Custom SCSS written for the Settings Redesign project may not translate well to other or future FxA projects. Component reuse may end up meaning SCSS overrides.

## Links

- [Settings Redesign project](https://github.com/mozilla/fxa/issues/3740)
- [CSS ADR part 1](https://github.com/mozilla/fxa/blob/master/docs/adr/0015-use-css-variables-and-scss.md)
- [Protocol colors](https://protocol.mozilla.org/fundamentals/color.html)
- Non-Atomic CSS libraries/frameworks: [Semantic UI](https://semantic-ui.com/), [Tailwind UI](https://tailwindui.com/), [Bootstrap](https://getbootstrap.com/), [Bulma](https://bulma.io/), [Pure.css]- (https://purecss.io/)
- Atomic CSS libraries: [Tailwind](https://tailwindcss.com/), [Tachyons](http://tachyons.io/), and [Basscss](https://basscss.com/)
