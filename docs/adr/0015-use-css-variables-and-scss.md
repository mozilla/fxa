# Use CSS Variables, Prefer SCSS over CSS-in-JS

- Deciders: Lauren Zugai, Jody Heavener
- Date: 2020-04-30

## Context and Problem Statement

The [Settings Redesign project](https://github.com/mozilla/fxa/issues/3740) offers an ideal opportunity to review CSS conventions and architecture for FxA to not only use while building new components for this project, but also for FxA moving forward.

This [part 1](https://github.com/mozilla/fxa/issues/4808) of [2](https://github.com/mozilla/fxa/issues/5087) ADR concerns the use of CSS variables, how they come into play with SCSS (vs using SCSS variables), CSS-in-JS considerations, and CSS modules.

Note that 1) "CSS variables" are technically called "CSS custom properties" but will be referred to as the common "variable" nomenclature throughout this ADR and that 2) SASS is a CSS preprocessor while SCSS is our preferred syntax of SASS (explained [here](https://stackoverflow.com/questions/5654447/whats-the-difference-between-scss-and-sass/5654471#5654471)).

## Decision Drivers

- Simplicity and clarity
- DRY and reusable styles
- Easy integration and use
- Current engineering experience and preferences

## Considered Options

### Styling variables

- SASS variables
- CSS variables
- A combination of SASS and CSS variables

### Styling placement

- CSS-in-JS with a helper lib like [`styled-components`](https://styled-components.com/) or [`react-jss`](https://cssinjs.org/react-jss/)
- CSS modules
- SCSS

## Decision Outcome

Chosen options: "CSS variables" and "SCSS", because:

- While using CSS variables with SASS will prevent using mixins (or SASS functions like `darken`) that rely on variable values, they can be used without impeding core functionality FxA uses SASS for like nested selectors, extends, and functions and mixins that don't rely on variable values like the generation and use of our media queries.
- CSS variables are native to the browser and decision to use them now is a prudent one. They have good browser support and can be used without a preprocessor and changed after preprocessor compilation. They are targetable by JavaScript, easily themed, and can be scoped globally or on an element, providing options for usage.
- Scoped component solutions (CSS-in-JS, CSS modules) encourage self-contained components rather than building the UI as a whole. While one goal of FxA is to reuse components across the ecosystem where possible (e.g. the `fxa-react` package), FxA will likely reap more benefits from a class-based approach. This allows for globally shared styles and a loosely coupled stylesheet rather than a tightly coupled CSS-in-JS solution with conditional styles based on props and how the component is used. Classes promote a DRYer and more consistent approach.
- CSS-in-JS would add one additional layer of tech to learn (like `styled-components` syntax and best practices) while the Settings Redesign project is already introducing other novel tech, and members of the FxA engineering team also as a whole personally prefer not to use CSS-in-JS.
- This decision doesn't preclude the option of implementing CSS modules at a later time if it's determined that we would prefer component scoped styles with SCSS, and CSS variables could still be used if we later switch to CSS-in-JS.

## Pros and Cons of the Options

### Styling variables

#### SASS variables

[SASS variables](https://sass-lang.com/documentation/variables) refer to CSS values set to a name, such as `$font-size`, in SASS files that can not only be referenced after their declaration but can also be used to utilize many of SASS's powerful features. They are compiled at runtime and do not exist in compiled CSS output.

Pros:

- SASS variables have been around for some time and have established best organizational practices.
- Using SASS variables would allow usage of more advanced SASS functions like calculations, functions like `darken`, and directives like `@if ($some-variable >= 14px)`.

Neutral:

- SASS variables are imperative and can only hold one value at a time so if the variable changes in value, earlier references will remain the same.
- We'd need to add to our `rescripts` webpack custom config to expose global SASS variables to all of our files.

Cons:

- SASS variables offer a limited set of "pre-compilation" power because variables can't be set dynamically after the stylesheet has been loaded.

#### CSS variables

[CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties), or CSS variables, provide a powerful native browser solution to setting CSS properties to variables. They are declared as `--font-color: grey` and used as `color: var(--font-color)` and are present in outputted CSS after SASS compilation.

Pros:

- We can still use many SASS features with CSS variables. We will still be able to nest selectors, use mixins that don't require calculations based on variable values such as our responsive design mixins (like `@include min-width('tablet')`) and other mixins with the purpose of shared styles for DRY'ing up our code.
- Choosing CSS variables helps to "future proof" FxA's front-end stack. Where SASS allows function execution on SASS variables, down the line we will be able to use CSS functions, such as color modifiers, on native CSS variables.
- CSS variables are easy to target with JavaScript when necessary and unlock new possibilities - while we have chosen to prefer CSS in SCSS files and not in JS (see the second decision made in this ADR), it does open the possibility of updating variable values if the use case arises.
- CSS variables are ideal for theming and will make a future "dark mode" feature requested by UX very straightforward, as we would simply change a set of variables either in a `prefers-color-scheme` media query or by checking a flag set in localStorage.
- CSS variables can be global or scoped to an element/selector. For example, variable values can change per class without having to set the property again:

```
h2 {
  --h2-color: grey;
  color: var(--h2-color);
}

.special h2 {
  --h2-color: black;
}
```

Neutral:

- While CSS variables meet the minimum browser compatibility list for FxA and have [great support otherwise](https://caniuse.com/#feat=css-variables), they aren't supported in IE11.
- CSS variables can be seen in developer tools. If there are many scoped to `:root` (globally) or the component in question, it can look like a lot of cruft, but this can also be convenient depending on what is being inspected.

Cons

- Since SASS functions, mixins, etc. are ran at runtime and CSS variables are dynamic, some SASS functionality is incompatible. However, FxA does not currently use SASS functions like `darken()` so the transition should be relatively painless, and we can still use the native CSS `calc()` property.
- Because CSS variables are fairly new, best practices and patterns are still being established. While some opinions have been formed based on work from the `fxa-admin-panel` and other small projects both in and outside work for Mozilla, we'll need to make some architectural decisions in part 2 of our CSS ADRs based on this experience and what we believe will pave the best way forward for FxA.

Small win: the Bento menu from the Monitor site, which we will be implementing in the Settings Redesign project, uses CSS variables.

### A combination of SASS and CSS variables

Static values (colors, font-sizes) could be declared as SASS variables while other values could be set as CSS variables.

Pros:

- Using both variable types would allow for calculations in mixins where needed from static values.
- It would be very clear what variables should never change.
- If implemented correctly and maintained, could take the best of both worlds between CSS variables and advanced SASS functionality.

Cons:

- This approach is unconventional and is likely to be confusing for current and new team members, plus open source contributors, without reading through FxA CSS stack documentation. Engineers may unknowingly set a variable as a SASS variable when it should be a CSS variable and vice versa. If some mixins can only be used with certain variables, it can lead to additional debugging for someone not acquainted with this decision. This goes against our desire for simplicity and clarity.

--

### Styling placement

### CSS-in-JS with a helper lib like `styled-components` or `react-jss`

CSS-in-JS solutions blend CSS into JavaScript, scope styles to the component, and typically live in the same file as the component declaration. Depending on the library, the syntax can resemble CSS or actually look quite different.

Pros:

- CSS-in-JS would allow us to take advantage of state-based styling without conditional class names, and instead, would set conditional styles.
- Would allow for easy deletion and maintenance of styles. If a component is deleted or moved, so are all of the related styles. Engineers could modify components with confidence that other components wouldn't be affected.
- We could still use CSS variables.
- Many CSS-in-JS libraries integrate well with React and `styled-components` is quickly growing in popularity.
- Since styles are scoped per component, generated CSS class names won't clash with each other as they are unique, and specificity-wise will be short and efficient. Engineers would not have to come up with a name for each class.

Neutral:

- Introduces less separation of concern between styles and components plus a more JS-like syntax for our CSS. This can be a pro or con depending on individual preference.

Cons:

- Since styles are scoped per component, it can lead to copypasta, less shared styles, and less consistency between components.
- We would be unable to use SASS features like mixins, causing us to reevaluate how we'd set our media queries and potentially other heavily relied on aspects of our current SCSS implementation.
- A library adds one more dependency layer to our stack, as well as one more piece of technology that our current and future team members would need to learn, and one more hurdle for open source contributors especially since CSS fixes are a common contribution. We would need to adjust to new nesting syntax and other conventions.
- Sharing styles between components is more straightforward in `styled-components` than `react-jss`, but is still more complex than adding a class name to reference shared styles.
- At least several team members have expressed a dislike for CSS-in-JS for various reasons.
- A minor inconvenience, but we would need to setup yet another linting file (a root-level `.stylelint`).

### CSS modules

[CSS modules](https://css-tricks.com/css-modules-part-1-need/) could help bridge the gap between an external stylesheet and CSS-in-JS as they allow for CSS in an external stylesheet while scoping styles to a component.

Pros:

- Can be used with SCSS, _and_ CSS or SASS variables.
- Can be viewed as "SASS with scoped classes." We could still get most of the SCSS benefits by using SCSS and setting classes for shared styles while benefitting from scoped component generated class names to prevent name clashes and relieve the need to manually name these classes.

Cons:

- Typical use would be to scope all styles for a component to that component, which would inherit the potential copypasta, less shared styles, and less consistency between components problem of CSS-in-JS. If we chose to use classes for shared styles and only scope unique component styles, simplicity and clarity could be muddled.
- Less separation of concern than the SCSS only option (but greater than CSS-in-JS), as it requires setting the styles on React components inline in the JSX.
- A combination of shared classes and scoped inline styles could make debugging CSS issues slightly more complex.
- Similar to CSS-in-JS but on a lesser scale, it would introduce yet another new frontend concept for our engineers to learn and understand.

### SCSS

[SASS](https://sass-lang.com/guide) is a CSS preposessor that converts external `.sass` or `.scss` files with variables, nesting, mixins, inheritence, and other conveniences into pure CSS. SCSS is a syntax flavor of SASS preferred by many.

Pros:

- The team is already familiar with and likes SCSS, and has expressed a preference of external styles over CSS-in-JS.
- SCSS is still a very popular choice for CSS organization and is included as a dependency in `create-react-app` by default.
- Encourages building the UI as a whole with shared styles instead of component encapsulation. While this could be a "con" in large projects with many shared components, FxA will have a lot of global shared styles and an SCSS class name based approach will result DRYer code.
- Offers handy functionality that we can still use with CSS variables like nesting and mixins.

Cons:

- Not as clear as some other solutions what styles are being applied per component without potentially checking multiple files.
- Requires naming convention standards for class names and organization to ensure easy maintenance.

## Links

- [Settings Redesign epic](https://github.com/mozilla/fxa/issues/3740)
- [CSS ADR part 1 GH issue](https://github.com/mozilla/fxa/issues/4808), [CSS ADR part 2 GH issue](https://github.com/mozilla/fxa/issues/5087)
- [`styled-components`](https://styled-components.com/), [`react-jss`](https://cssinjs.org/react-jss/)
- [SASS](https://sass-lang.com/guide), [SASS variables](https://sass-lang.com/documentation/variables), [SASS vs SCSS](https://stackoverflow.com/questions/5654447/whats-the-difference-between-scss-and-sass/5654471#5654471)
- [CSS custom properties/variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [CSS variables caniuse](https://caniuse.com/#feat=css-variables)
- [CSS modules](https://css-tricks.com/css-modules-part-1-need/)
