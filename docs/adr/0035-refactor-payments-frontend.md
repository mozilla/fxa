# Refactor Subscription Platform frontend

- Status: proposed
- Deciders: Ben Bangert
- Date: 2023-03-07

## Context and Problem Statement

The Subscription Platform frontend has become overly complex, making it inflexible and difficult to work with. This has resulted in longer development times on new features and in some cases left us unable to easily accommodate requests from relying parties.

Additionally, as the app has grown, so have the number of network calls causing a reduction in app performance.

Finally, including some application logic on the frontend, has made it more complex than necessary. As a result it is harder to maintain, and less flexible and harder to change.

To address the problems briefly discussed above, and to meet current and future feature and relying party requests refactoring of the existing Subscription Platform is necessary.

## Decision Drivers

- Faster development - This applies to both the refactoring necessary for SubPlat 3.0, as well as future relying party and feature requests
- Easier routing - The SubPlat teams wants to perform more advanced routing to allow features such as, Relying Party specific checkout pages, A/B testing, etc,
- GraphQL support - Improve app performance and responsivness by reducing the number of network requests
- Reuse existing components - We have received generally favourable reviews of our existing frontend look and feel, and want to keep the appearance the same

## Considered Options

- A. React Framework - Next.js
- B. React, Typescript, without Redux
- C. React, Typescript, with Redux

## Decision Outcome

Chosen option: "[option 1]", because [justification. e.g., only option, which meets k.o. criterion decision driver | which resolves force force | … | comes out best (see below)].

## Pros and Cons of the Options

### A. React Framework - Next.js

Use a React framework.

- Good, because it provides many benefits, without compromising flexibility, that would require additional libraries otherwise. (Routing, rendering options, image optimization, etc.)
- Good, because of its routing simplicity and flexibility
- Good, because its built in tooling, which reduces existing bespoke tooling currently used
- Good, because it is easy to learn the basics
- Good, because of its large community support and popularity
- Good, because it is used by other teams in Mozilla
- Bad, because it adds another layer on top of React
- Bad, because it's new to most team members, and requires some learning to use more complicated features
- Bad, because it diverges from tooling used elsewhere in the FxA monorepo

### B. React, Typescript, without Redux

Use the existing fxa-payments-server app and only remove redux.

- Good, because simplifies the app by removing complexity of using Redux
- Good, because it would mostly use the existing technologies, and not require new learnings for the team
- Bad, because Rescripts and other tooling make it difficult to upgrade React tooling. (See [FXA-5242](https://mozilla-hub.atlassian.net/browse/FXA-5242))
- Bad, because it will still require significant refactoring to remove Redux and introduce GraphQL
- Bad, because page routing with react-router is complicated

### C. React, Typescript, with Redux

Use the existing Subscription Platform, and only refactor existing code.

- Good, because it requires the least amount of new technologies and libraries
- Bad, because staying with redux keeps complexity in the app without much benefit
- Bad, because it will still require refactoring to introduce GraphQL, remove application logic, and reduce component complexity
- Bad, because Rescripts and other tooling make it difficult to upgrade React tooling. (See [FXA-5242](https://mozilla-hub.atlassian.net/browse/FXA-5242))
- Bad, because page routing with react-router is complicated
