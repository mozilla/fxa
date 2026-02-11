# Refactor Subscription Platform frontend - with Next.js

- Status: accepted
- Deciders: Reino Muhl, Ben Bangert, Lisa Chan, Lauren Zugai, Bianca Danforth
- Date: 2023-03-07

## Context and Problem Statement

The Subscription Platform frontend has become overly complex, making it inflexible and difficult to work with. This has resulted in longer development times on new features and in some cases left us unable to easily accommodate requests from relying parties.

Additionally, as the app has grown, so have the number of network calls causing a reduction in app performance. The aim is to refactor the app to have one network call for each action.

Finally, the frontend includes some business and application logic, which has made components and parts of the app unnecessarily complex. As a result the frontend is less flexible, and harder to change and maintain. To solve this, the Subscription Platform team wants to move all business and application logic to the backend.

To address the problems briefly discussed above, and to meet current and future relying party and feature requests, refactoring of the existing Subscription Platform is necessary.

## Decision Drivers

- Faster development - This applies to both the refactoring necessary for SubPlat 3.0, as well as future relying party and feature requests
- Easier routing - The SubPlat teams wants to perform more advanced routing to allow features such as, Relying Party specific checkout pages, A/B testing, etc,
- GraphQL support - Improve app performance and responsivness by reducing the number of network requests, and promotes consistency across the FxA monorepo.
- Reuse existing components - We have received generally favourable reviews of our existing frontend look and feel, and want to keep the appearance the same

## Considered Options

- A. React Framework - Next.js
- B. React Framework - Gatsby.js
- C. React, Typescript, without Redux
- D. React, Typescript, with Redux
- E. React Framework - Remix

## Decision Outcome

Chosen option: "A. React Framework - Next.js", because a significant amount of refactoring is necessary to accomplish the Subscription Platforms goals, now would be a good time to adopt a React framework and start from a mostly clean slate, since it partially or completely meets all of the decision drivers, especially the easier routing and faster development drivers.

Regarding why Next.js is favored over Gatsby.js, before completing the ADR, the subscription platform team went through a prototyping project and found the two frameworks to be remarkably similar in capabilities. However due to Next.js's popularity, use by other teams in Mozilla and a team vote, the decision was made to pick Next.js.

## Pros and Cons of the Options

### A. React Framework - Next.js

Use a React framework, Next.js.

- Good, because it provides many benefits out of the box, without compromising flexibility, that would require additional libraries otherwise. (Routing, rendering options, image optimization, etc.)
- Good, because of its routing simplicity and flexibility (See [[1] More information](#more-information))
- Good, because of its built in tooling, which reduces existing bespoke tooling currently used
- Good, because it is easy to learn the basics
- Good, because it's parent company has other tools that work well with Next.js and enhance its capabilities. (Turbopack, SWR, etc.)
- Good, because of its large community support and popularity
- Good, because it is used by other teams in Mozilla
- Good, because it no longer uses Redux for state management, which was determined to be too complex for our needs
- Bad, because it adds another dependency and layer on top of React
- Bad, because it's new to most team members, and requires some learning to use more complicated features
- Bad, because it diverges from tooling used elsewhere in the FxA monorepo
- Bad, because it requries significant refactoring, starting from a clean slate, simplyfing and reusing existing components and styling where possible

### B. React Framework - Gatsby.js

Use a React framework, Gatsby.js. (Gatsby has similar good and bad points to Next.js)

- Good, because it provides many benefits out of the box, without compromising flexibility, that would require additional libraries otherwise. (Routing, rendering options, image optimization, etc.)
- Good, because of its routing simplicity and flexibility (See [[1] More information](#more-information))
- Good, because of its built in tooling, which reduces existing bespoke tooling currently used
- Good, because it is easy to learn the basics
- Good, because it no longer uses Redux for state management, which was determined to be too complex for our needs
- Neutral, because of its large community support and popularity, but smaller compared to Next.js
- Neutral, not currently used by other teams in Mozilla
- Bad, because it adds another dependency and layer on top of React
- Bad, because it's new to most team members, and requires some learning to use more complicated features
- Bad, because it diverges from tooling used elsewhere in the FxA monorepo
- Bad, because it requries significant refactoring, starting from a clean slate, simplyfing and reusing existing components and styling where possible

### C. React, Typescript, without Redux

Use the existing fxa-payments-server app and only remove redux.

- Good, because simplifies the app by removing complexity of using Redux, which was determined to be too complex for our needs
- Good, because it would mostly use the existing technologies, and not require new learnings for the team
- Bad, because Rescripts, CRA, and other tooling make it difficult to upgrade React tooling. (See [FXA-5242](https://mozilla-hub.atlassian.net/browse/FXA-5242))
- Bad, because it will still require significant refactoring to remove Redux and introduce GraphQL
- Bad, because page routing with react-router is complicated

### D. React, Typescript, with Redux

Use the existing Subscription Platform, and only refactor existing code.

- Good, because it requires the least amount of new technologies and libraries
- Bad, because staying with redux keeps complexity in the app without much benefit
- Bad, because it will still require refactoring to introduce GraphQL, remove application logic, and reduce component complexity
- Bad, because Rescripts, CRA, and other tooling make it difficult to upgrade React tooling. (See [FXA-5242](https://mozilla-hub.atlassian.net/browse/FXA-5242))
- Bad, because page routing with react-router is more complicated, needing to learn a routing library, compared to the file-based routing used by popular React frameworks. (See [[1] More information](#more-information))

### E. React Framework - Remix

Use the existing Subscription Platform, and only refactor existing code.

- Good, because it provides an improved developer experience
- Neutral, because it only provides server side rendering
- Neutral, because it is not used by other teams in Mozilla
- Neutral, because of confusing nested routing functionality
- Bad, because it is not as production tested and mature a project as Next or Gatsby
- Bad, because it has a smaller community
- Bad, because it requries significant refactoring, starting from a clean slate, simplyfing and reusing existing components and styling where possible.

## More information

[1] [File-based routing with React Router](https://omarelhawary.me/blog/file-based-routing-with-react-router)

> In a traditional client-side React routing setup with React router, you’ll declare your routes within a <Switch /> component by adding a <Route/> component for each page, specifying a path and a corresponding component to be rendered as a page. It works fine but it lacks universal convention. Also when declaring many routes it becomes hard to follow, at least in my experience.
>
> With file-based routing you don’t import page components manually. Instead you define all your routes by adding/removing/renaming files within a directory called pages by convention. Each file inside the pages directory will represent a route in your application. That makes it easier to visualize and manage as the pages directory structure reflects all existing routes. You can also have dynamic routes with special file names and nested routes with sub-directories. We’ll discuss some of the file-based routing common patterns shortly.

## Links

- [Next.js and Gatsby.js prototypes](https://docs.google.com/document/d/1SHfC3bxuqIizvv26YjqqoGbyLuA-uaD69SiwH63IIHc/edit#bookmark=id.w6omvcx8gwdg)
- [Next.js](https://nextjs.org/)
- [Gatsby](https://www.gatsbyjs.com/)
- [React Router](https://reactrouter.com/en/main)
- [ADR "Create a New React Application for the Settings Redesign Project"](https://github.com/mozilla/fxa/blob/main/docs/adr/0011-create-new-react-app-for-settings-redesign.md)
- [ADR "React Toolchain for Settings Redesign"](https://github.com/mozilla/fxa/blob/main/docs/adr/0013-react-toolchain-for-settings-redesign.md)
