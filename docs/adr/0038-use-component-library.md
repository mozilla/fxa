# Use a React component library

- Status: proposed
- Deciders: Reino Muhl
- Date: 2023-04-03

## Context and Problem Statement

As part of a major refactor of the Subscription Platform, the team is trying to simplify and reduce the number of components used by the Subscription Platform web app. To that end the team is investigating whether or not to replace some of the more commonly used components, such as a Tooltip, DialogModal, etc., with a component library that provides out of the box features such as accessibility and screen reader support, for example.

Additionally, maintaining and implementing the existing components sometimes comes with additional developer cost. For example, during a recent refactor introducing TailwindCSS, it was difficult to refactor items in the bespoke component library due to deeply nested styling.

## Decision Drivers

- Accessibility
- Speed of development
- Maintainability

## Considered Options

- A. Unstyled component library
- B. Styled component library
- C. Bespoke components

## Decision Outcome

Chosen option: A. Unstyled component library. Using an unstyled component library, also sometimes referred to as a headless component library, meets all key decision drivers, with few draw backs. Unstyled components allows the team to bring their own existing styling library, TailwindCSS, and brings
Unstyled components work well with styling libraries like TailwindCSS, and provide accessibility features etc. out of the box, which would otherwise need to be added and maintained by the team, on bespoke components.

## Pros and Cons of the Options

### A. Unstyled component library

- Good, because it provides accessibility, screen reader support, keyboard navigation, focus management, etc. out of the box
- Good, because it provides a consistent developer experience
- Good, because it allows the team to bring the existing design system
- Good, because it works well with the teams styling library TailwindCSS
- Good, because it can be dropped in where necessary, without interferring with existing components
- Neutral, because it doesn't have all components and still requires developer time to add new components, or wait for the library to add support
- Bad, because it is opinionated
- Bad, because it adds additional dependencies

### B. Styled component library

- Good, because it provides accessibility, screen reader support, keyboard navigation, focus management, etc. out of the box
- Good, because it provides a consistent developer experience
- Bad, because it encourages or enforces the library's design system
- Bad, because it has a steep learning curve, and ties in more tightly with the code base
- Bad, because it requires initial effort to adapt style components to match current designs
- Bad, because it is opinionated
- Bad, because it adds additional dependencies

### C. Keep bespoke component library

- Good, because it provides the most flexibility
- Good, because most required components have already been built
- Bad, because it requires the most effort to maintain existing components
- Bad, because it requires more developer time to add new components
- Bad, because it requires internal maintenance to provide a consistent developer experience
