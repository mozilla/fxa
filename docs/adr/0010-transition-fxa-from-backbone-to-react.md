# Transition FxA from Backbone to React

- Deciders: Lauren Zugai, Les Orchard, Danny Coates
- Date: 2020-03-19

## Context and Problem Statement

When Firefox Accounts was created some 6-7 years ago, the front-end Javascript framework and HTML templating options were limited significantly to those available at the time. This ADR details the pros and cons of various FE libraries and frameworks, and why it is desirable for FxA to move to a different technology. It does not cover _how_ we will begin the conversion which can be [read about here](https://github.com/mozilla/fxa/blob/main/docs/adr/0011-create-new-react-app-for-settings-redesign.md).

While Backbone and Mustache have served their purposes for FxA thus far, other modern libraries and frameworks not only offer more appealing architecture and developer conveniences, but also offer better data predictability, potential performance boosts, and a strong community of online support.

## Decision Drivers

- The desire for a more modern FE architecture and a more efficient UI
- As Backbone declines in popularity, the desire to move to a library or framework actively being improved with great community support is prevalent
- A modern framework will likely feel more familiar to new engineers to the team as well as open source contributors

## Considered Options

- Option A - Continue to use Backbone
- Option B - Move to client-side React
- Option C - Move to isomorphic React
- Option D - Move to Angular
- Option E - Move to VueJS
- Option F - Other considerations (Web Components)

## Decision Outcome

Chosen option: "Option B - Move to client-side React", because

- The team desires the benefits we will gain from moving to a more modern library (excluding option A)
- The team has experience with (and likes) React
- We're already using it in other parts of the ecosystem, i.e. the payments server
- FxA does not need server-side rendering (option C)
- Angular (option D) is heavy, opinionated with a steep learning curve, and offers at least some features we won't need
- Web components and libraries around them (option F) are quite new, yet a distant potential architecture shift from React to web components appears to be far less dramatic than from Backbone to React

In the end, it is recognized that Vue _may_ have been a good option for FxA, but React was chosen over Vue due to:

- existing FxA engineering team knowledge
- the FxA payments server is already using React
  - React has already been reviewed by our security team and "passed" the trial run when it was novel tech in our stack
- As one of our desires is to best protect against such a major refactor proposal in the future, we have to allow package age, online support, popularity and backing, and stability to be factors in our decision.

## Pros and Cons of the Options

### Option A - Continue to use Backbone

- Description
  - Don't introduce a new framework and keep using Backbone and Mustache.
- Pros
  - No tech debt or large refactoring effort would be necessary right now.
- Cons
  - As Backbone's popularity continues to wane, we will likely be presented with challenges in the future around support, documentation, features, and developer knowledge or experience with the framework.
  - We'd be giving a hard pass on all of the benefits we would gain from another library or framework - i.e. modern approaches, better data clarity and typing, performance optimizations, etc.

Note: also see pros/cons listed on Backbone in general [in this ADR](https://github.com/mozilla/fxa/blob/main/docs/adr/0002-use-react-redux-and-typescript-for-subscription-management-pages.md)

### Options B - E - Common Pros & Cons

These pros and cons are shared for the rest of the choices. The pros and cons listed for all subsequent options will be in comparison to _each other_ and not against option A.

- Description
  - Move away from Backbone/Mustache in the content server in favor of another option.
- Pros
  - Future-proof the FE stack for the foreseeable future: modern libraries and frameworks have significant backings and resources placed to work on them (i.e. Angular by Google, React by Facebook) and are continuing to gain community and feature support.
  - Benefit from the modern architectural approaches and features other technologies offer.
  - Increase the chance of new engineers to the team as well as open source contributors being familiar with the stack.
  - While refactoring, our tests can be assessed for need and clarity. A fresh pair of eyes on these can point out superfluous tests or those we lack.
- Neutral
  - Modern libraries and frameworks (React, Angular, VueJS) all offer some flavor of virtual DOM for rerenders and DOM manipulations, and offer performance boosts and optimizations out of the box that Backbone does not offer. To varying degree, we would expect to see a performance boost, but there may be cases in which a granular DOM update would be faster without a virtual DOM.
- Cons
  - We will gain tech debt regarding a large refactor effort that may be ongoing for some time.
  - A lot of work was put into FxA and moving away from Backbone won't be a simple task. There is a lot of infrastructure we must ensure support for and respect the integrity of.
  - A transition from Backbone to any of the options won't be 1:1 - that is to say, Backbone and Mustache closely resemble the common "MVC" pattern, where Backbone models tied to collections represent the "M", Backbone views act as the "C", and our Mustache templates act as the "V" layer. Angular and Vue appear to follow patterns more closely described as "MVVM", and while React can broadly be seen as the "V" in "MVC", React architecture typically follows the Flux design pattern. We will need to carefully translate pieces of Backbone models and controllers into state, helper functions, or Typescript interfaces where applicable.
  - Whatever new library or framework we choose will require a learning curve for at least part of the team. It may slow the ability to make front-end changes at first.
  - Since the timeline of a full transition is unknown, team members will have to learn or become familiar with both Backbone and the library or framework we transition to.

### Option B - Move to client-side React

- Description:
  - Use client-side React.
- Pros
  - React is backed by a well-known company (Facebook) with a lot of dedicated resources working on the library and it's popular, has a lot of community support, and has ample documentation.
  - The `fxa-payments-server` is already using React. We can begin thinking about reusing components across the FxA monorepo.
  - React promotes simplicity, clarity, and predictability. We know that data exists at the top and it flows down to children components, and we know what the data is with prop and type checking. The component then takes the data and subjects it to lifecycle methods that execute in a predictable manner every time. Backbone, on the other hand, creates a JSON object that is exposed to mustache files, but we don't always know what this data is or what its types are. Backbone also oftentimes influences views via updates through a model, multiple models, and/or controllers. It's not as clear when a view or its children will be rerendered or a DOM element updated.
  - React is fast. It bundles state updates together and figures out the fewest operations it can get away with, giving us optimization wins out of the box.
  - React promotes declarative programming over imperative. In Backbone, we interact with the DOM directly via jQuery, _telling_ the browser exactly what to do (imperative) but with React, we _describe_ the UI with components and let React and the browser figure out how to implement it (declarative). This can be much less tedious for developers and allows React to handle state changes optimally.
  - React promotes the idea of composition over inheritance. In Backbone, we extend views for reusability, which can cause difficulty in seeing or realizing what events and other methods or data you are inheriting (the [banana, monkey, jungle problem](http://rcardin.github.io/design/programming/oop/fp/2018/07/27/the-secret-life-of-objects-part-2.html#the-banana-monkey-jungle-problem)) and overwriting. The intention of components in React is more clear and data is more deliberately passed around.
  - React offers many integration options.
  - React has already been audited by our security team.
- Cons
  - React changes fairly often. The definition of "knowing React" will continue to grow as new concepts and best practices, like React Hooks or deprecated lifecycle methods, are created or recommended.
  - There have been previous issues with the licensing around React. Facebook switched several of its open-source projects, including React, [from a BSD+Patents license to an MIT license in 2017](https://www.freecodecamp.org/news/facebook-just-changed-the-license-on-react-heres-a-2-minute-explanation-why-5878478913b2/) after community pressure.
  - While Facebook has held its dominance in the social media realm for more than 10 years, we cannot assume it will always be the leader in the industry and understand it may wane in popularity in the future. However, some risk around potential decreasing popularity is mitigated as Airbnb, Uber, Pinterest, Twitter, Reddit, Netflix, and other major companies also use React.

### Option C - Move to isomorphic React

#### Description

Server-side rendering (SSR) is a technique for rendering a client-side single page app (SPA) on the server and then sending a fully rendered page to the client. It is one _part_ of an "Isomorphic" or "Universal" React application which are terms used synonymously.

How a client-side React app typically operates:
Browser requests page -> server sends mostly empty HTML with script tag(s) -> browser downloads page and requests scripts -> React takes over and fetches required data -> React receives and processes data and _displays content_

How a SSR React app typically operates:
Browser requests page -> server loads React in memory, fetches required data, renders React app, sends HTML down to the browser -> browser downloads page and _displays content_ -> Client React takes over

- Pros over option B
  - Less process burden on the client-side and improved First Meaningful Paint over client-only React gives a perceived performance boost.
  - Offers much better SEO possibilities.\*
    - \*This is one of the primary benefits SSR offers, yet is not applicable to FxA because our pages are hidden from search engines for security reasons.
- Cons over option B
  - Requires duplicate Redux stores and manually keeping sync in state with the server and client, or using a framework like NextJS.
  - Adds another layer of complexity and a sharper learning curve to the tech stack.
  - It may give a performance boost on slow devices since the server does more work, but it doesn’t actually solve a heavy initial network request problem.
  - There is a very brief period between the initial render and React rehydrating in which if a user very quickly interacts with something, it may do nothing.

### Option D - Move to Angular

- Description
  - Use AngularJS.
- Pros
  - Angular is backed by a well-known company (Google) with a lot of dedicated resources working on the framework and it's popular, has a lot of community support, and has good documentation.
  - It provides some features we likely would use in FxA without another package dependency. Certain things may just "work" automagically.
- Cons
  - Angular has a steep learning curve.
  - Since Angular is a full-on "framework," it results in a heavier bundle and can result in a slower application compared to React or Vue.
  - It provides many features we likely wouldn't use in FxA.
  - Angular is opinionated and expects things to be done in specific ways. While this could make it easier for a developer already familiar with Angular to ramp up on the project, this could set limitations on how we want to architect our application.
  - Significant changes have historically been introduced to the framework.

### Option E - Move to VueJS

- Pros:
  - Vue is used proudly by the community of developers that support it. The enthusiasm for open-source and attitude around making something "for developers" aligns with the Mozilla mission.
  - Vue is flexible - it allows app structure as seen fit and supports many different HTML templating languages.
  - Likely has the smallest learning curve.
- Neutral:
  - Allows for mutable state.
- Cons:
  - Vue is the newest library of the bunch, has a much smaller community than other options, and does not have a large company backing. It may not be as battle-tested as other options as a result or have as much documentation support when we run into specific issues.

### Option F - Other considerations (Web Components)

Web components were also considered. However, these are not a library, but are instead "a set of web platform APIs that allow you to create new custom, reusable, encapsulated HTML tags to use in web pages and web apps." They offer strong encapsulation and can be used in any JS framework or library that works with HTML, but don't meet the needs of FxA by themselves. See a more detailed description [with examples here](https://css-tricks.com/an-introduction-to-web-components/).

Using web components with the [Polymer Project](https://www.polymer-project.org/) that allows for functional templates like React but without a virtual DOM could be worth keeping an eye on as the technology matures.

## Links

- [Create a new React app for Settings Redesign](https://github.com/mozilla/fxa/blob/main/docs/adr/0011-create-new-react-app-for-settings-redesign.md)
- Other Backbone pros/cons: [subscription management stack ADR](https://github.com/mozilla/fxa/blob/main/docs/adr/0002-use-react-redux-and-typescript-for-subscription-management-pages.md)
- [Facebook switches licensing](https://www.freecodecamp.org/news/facebook-just-changed-the-license-on-react-heres-a-2-minute-explanation-why-5878478913b2/)
- [Banana, monkey, jungle problem](http://rcardin.github.io/design/programming/oop/fp/2018/07/27/the-secret-life-of-objects-part-2.html#the-banana-monkey-jungle-problem)
- [React](https://github.com/facebook/react)
- [NextJS](https://github.com/zeit/next.js/)
- [AngularJS](https://github.com/angular/angular.js/)
- [VueJS](https://github.com/vuejs/vue)
- [Web Components](https://css-tricks.com/an-introduction-to-web-components/)
- [lit-html](https://lit-html.polymer-project.org/guide)
