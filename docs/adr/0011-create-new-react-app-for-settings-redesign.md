# Create a New React Application for the Settings Redesign Project

- Deciders: Lauren Zugai, Les Orchard, Danny Coates, Wil Clouser
- Date: 2020-03-19

## Context and Problem Statement

"Settings" refers widely to the `accounts.firefox.com/settings` page where users can manage their Firefox account. The "Settings Redesign Project" refers to a 2019/2020 project centered around giving this page a fresh user interface. The changes are fairly significant and will require a lot of component shuffling and some functionality refactoring. [See the PRD](https://docs.google.com/document/d/18zu7JCYIsUp8tUMJqb2uErNlzL9f6CQvefLy9HFZ4UY/edit?pli=1#heading=h.cf57dt1i8634).

The FxA Engineering team desires to migrate from [Backbone and Mustache to React](https://github.com/mozilla/fxa/blob/main/docs/adr/0010-transition-fxa-from-backbone-to-react.md). This ADR addresses questions around what level of action we should take regarding this desire and the Settings Redesign Project - should a conversion to React be done at a later time, or are the changes significant enough to justify propelling us into React now?

## Considered Options

- Option A - Use the existing JS framework (Backbone) and templating library (Mustache), and make all changes in these files
- Option B - Take the "100/0" approach by creating all new components with React, but modify existing Backbone/Mustache files
- Option C - Take the "ground up" approach and create a new settings React application

## Decision Outcome

Chosen option: "Option C - Take the 'ground up' approach and create a new settings React application", because

- The overall goal of the Settings Redesign Project is to offer more flexibility to expand Settings functionality. New features have already been planned. It could be argued that heavy refactoring later (which would be needed for option A or B) would take just as much time as recreating this page with React now.
- This approach allows us an opportunity to set up Storybook for the content server and review our tests, CSS, and a11y implementations as we implement the UI changes.
- This approach also simplifies our GH workflow and A/B testing the entire redesign.

We can mitigate risks by avoiding a "big bang" surprise replacement by implementing, deploying, and launching smaller pieces of MVP functionality along the way under a new front-end route serving the React application while keeping the Backbone Settings live. While this may be tedious, it can be a safety net against losing integrity and wisdom earned in the original system.

## Pros and Cons of the Options

### Option A - Use the existing JS framework (Backbone) and templating library (Mustache), and make all changes in these files

- Description
  - Use Backbone and Mustache for the Settings Redesign Project. The conversion to or addition of React should be done as a separate project.
- Pros
  - Allows for reuse of the existing `fxa-content-server`. At the component level, many changes can be satisfied with Mustache/CSS updates.
  - Requires less initial setup and the changes will be in production much more quickly.
- Cons
  - There are a few significant functionality changes, and all of the functionality we refactor or create for this project will need to be refactored again later with React.
  - On the same note, this does not set us up well for future feature requests that will come later this year. We would be forced into Option B or continue with Option A; either way, the React conversion backlog would continue to grow.
  - Integration into `main` must be done carefully and A/B testing these changes may be complicated.

##### Option B - Take the "100/0" approach by creating all new components with React, but modify existing Backbone/Mustache files or refactor these components as React components

- Description
  - Use a combination of React and Backbone/Mustache for the Settings Redesign Project. If components already exist, modify them in Backbone/Mustache, and create new components in React. Possibly begin Backbone-to-React integration where it makes sense to do so. While the full conversion to React should be done as a separate project, the "100/0" approach suggests that in FxA from now on, new components should be created in react.
- Pros
  - Can reuse the existing `fxa-content-server`. At the component level, many just need Mustache/CSS updates.
  - Requires less initial setup and upfront refactoring so the changes will be in production much more quickly.
  - Allows us to piecemeal React into Settings, resulting in less future refactoring than option A while avoiding the taboo "ground up remake" approach, and allows for the creation of some React components that could be used elsewhere in the FxA ecosystem.
- Cons
  - The full benefits of a React application won't be realized until many more pieces are converted.
  - Many popular Backbone-to-React integration guides use a combination of React and Backbone with approaches like embedding React components in Backbone views, wrapping the Backbone app with React, and/or keeping data synchronized between a Redux store and Backbone. It's preferable to move away from an interlinked dependency of the two and thus would require refactoring later. Packages (like [NestedReact](https://github.com/VoliJS/NestedReact/blob/main/docs/05_Migration_from_Backbone.md)) offer a convergence layer between the two, but is an additional dependency we would want to remove later.
  - Integration into `main` must be done carefully and A/B testing these changes may be complicated.

##### Option C - Take the "ground up" approach and create a new settings React application

- Description
  - Create a new React application for the Settings page and approach it with an incremental view-by-view build up.
- Pros
  - Propels us into our new framework of choice and reduces future refactoring efforts.
  - Settings doesn't have to manage different integrations like the signin/signup flows do. It seems like a reasonable place to begin our conversion regardless of a redesign.
  - Allows for a fresh start and audit of our HTML semantics, CSS architecture, and accessibility practices as components are being built.
  - Allows for test auditing and scrutiny. We can potentially remove superfluous tests or add those we lack.
  - May allow for a fresh take on how we do metrics in Settings.
  - Offers an opportunity to set up and use Storybook in FxA. If we do a view-by-view build up, we can deploy changes somewhere for UX and other folks to see progress and request tweaks as features are built out.
  - We can potentially use this as an opportunity to review and extract model and API code from the existing settings app into shared modules.
  - Management in GitHub is easy, as changes can go directly into `main` and no feature flagging or branches held in isolation from `main` will be necessary. A/B testing will also likely be easier.
- Cons
  - A "ground up remake" is generally viewed as taboo. Changing such a large chunk of the front-end codebase doesn't come without its own set of risks.
  - This approach will take much longer to rollout than previous options.

## Links

- [Settings Redesign Project PRD](https://docs.google.com/document/d/18zu7JCYIsUp8tUMJqb2uErNlzL9f6CQvefLy9HFZ4UY/edit?pli=1#heading=h.cf57dt1i8634)
- [Backbone to React ADR](https://github.com/mozilla/fxa/blob/main/docs/adr/0010-transition-fxa-from-backbone-to-react.md)
- [React](https://github.com/facebook/react)
- [Backbone](https://backbonejs.org/)
- [Mustache](https://github.com/mustache/mustache.github.com)
- [NestedReact](https://github.com/VoliJS/NestedReact/blob/master/docs/05_Migration_from_Backbone.md)
