# Use a documented Application Architecture for new back-end services

- Deciders: Ben Bangert, Ryan Kelly, Vijay Budhram, Jody Heavener, Danny Coates, Dave Justice
- Date: 2020-08-12

## Context and Problem Statement

The FxA back-end service stack contains an application architecture that is ad-hoc, not documented, and missing modern features (such as Dependency Injection) which results in the following problems:

- New developers struggle to get up to speed as they must learn the architecture by reading the code as we have no documentation on the application structure, why they're structured the way they are, or how new components should be added to fit in. Each back-end service may vary in its ad-hoc architecture as well.
- Adding new objects needed in a route handler can be time-consuming as the object must be plumbed through the entire initialization chain vs. more elegant methods like Dependency Injection (DI).
- Not clear where/how to add new components and takes time to study/understand how things are currently setup in an attempt to mimic the structure for the new component.
- Time consuming to setup boiler-plate for components, as we have no tooling to work with the current ad-hoc application architectures.
- Our ad-hoc architecture frequently mixes concerns such as having business logic mixed in with request handling logic, and has other warts from its evolution over time vs. being planned up front.
- New back-end services evolve differently resulting in more ad-hoc application architectures to learn.
- Shared components in `fxa-shared` can't rely on basic object lifecycles or setup approaches as they may be used in multiple different ad-hoc application architectures.

Not choosing an application framework means that we have choosen to make ad-hoc application architectures which will continue to exhibit the problems above.

It is assumed that the four newest FxA back-end services (admin-server, support-panel, event-broker, gql-api) will be switched to the chosen approach for consistency.

## Decision Drivers

- Documented application architecture.
- Tooling that reduces boiler-plate and creates consistent code architecture.
- Modern paradigms to ease creation of global objects and their testability, such as DI.
- Training materials so that new developers can understand and work on application features easily.
- Ability to migrate legacy applications to similar conventions/setup.
- Handles situations we need such as:
  - Exception handling
  - Validation
  - Service instantiation (DI, etc)
  - Authentication
  - RESTful API's (Swagger/OpenAPI a bonus)
  - GraphQL
  - Use of components/services easily in a script

## Considered Options

- Evolve/improve our ad-hoc application architecture with docs, tools, etc.
- Use an existing well-documented and popular application framework such as:
  - NestJS
  - Adonis
  - LoopBack

## Decision Outcome

Chosen Option: Use an existing framework: NestJS

NestJS and LoopBack are the two most compelling options, however NestJS has substantially better GraphQL support and a much larger user-base. LoopBack has its user-base divided between two versions with substantial changes between them. We will use NestJS for new projects and update the newest services (admin-server, support-panel, event-broker, gql-api) to NestJS.

To reduce documentation needs and address that auth-server will not be reasonable to migrate, we will backport code organization schemes and directory/filename conventions from NestJS and use `typedi` as a DI system to ease configuration/testing in auth-server and possibly other legacy packages. This will allow developers familiar with NestJS projects to still locate and easily work on FxA legacy packages.

### Positive Consequences

- Less documentation to create, as we only document differences for legacy services.
- NestJS GraphQL support matches existing typegraphql paradigm closely for minimal effort switch.

### Negative Consequences

- There will be some effort involved to migrate the 4 packages to NestJS.
- We will need to document the differences between NestJS and other legacy services.

## Pros and Cons of the Options

### Evolve/improve our ad-hoc application architecture with docs, tools, etc.

Our existing ad-hoc structure typically involves a few chosen libraries and a basic directory structure. Error handling differs in several of the back-end services, while validation is always provided by the `joi` library. To document our ad-hoc application architecture we would first need to make clear choices about what libraries we use and how their use should be structured in the application. We could then write tooling and documentation around these choices.

- Pros:
  - Could be easier to convert our existing backend services as they will likely be closer in libs/structure to the choosen structure if desired.
  - Our choice of exactly what our application architectures look like and what libraries are used.
- Cons:
  - Creating even a portion of the documentation, tooling, and training material as already exists for any of the other three options is an incredible amount of effort/work.
  - We will likely end up copying many of the features/layout/tools that already exist with communities for the other options.
  - Contributers will not be familiar with our application architecture since only FxA uses it.

### Use an existing framework: NestJS

NestJS is a modern framework built in TypeScript 2 years ago that provides application architecture built on top of existing popular Node ecosystem libraries such as Express, Jest, etc. with adapters to switch these out for other preferred libraries.

- Pros:
  - Builds upon mature popular Node libraries for underlying http/gql/etc implementations.
  - Udemy courses available.
  - Extensive NestJS module ecosystem and blog posts on architecture approaches.
  - Flexible and swappable underlying implementations (Express, Fastify, apollo-server, etc).
  - Built-in support for RESTful API's, GraphQL, Websockets, microservices (distributed processing), and more.
  - Modern architecture built on TypeScript with DI using a simple registration system.
  - 28k github stars (most popular by this measure of these three).
  - GraphQL implementation is built with almost identical TypeScript decorators, which will make moving gql-api and admin-server over to NestJS fairly straight-forward.
- Cons:
  - Uses some reactive javascript approaches for more advanced internal functionality that less developers are familiar with.
  - While the differences between underlying implementations are smoothed over with TypeScript adapters and interfaces, if we need to do extensive under-the-hood customization this could become annoying.
  - Underlying implementations can be swapped, but doing so removes some of the useful boiler-plate tooling that assumes you're using the default choices (Express, Jest).

### Use an existing framework: Adonis

AdonisJS was started as an open-source project in 2015. It intentionaly avoids using other libraries to implement underlying functionality, believing that they cannot be integrated cleanly without crufty glue code.

- Pros:
  - Latest version built with TypeScript (but still in a Preview Release mode).
  - Includes modern application approaches with an Inversion-of-Control container for DI.
  - Mature framework, started in 2015.
  - Integrates tightly with its own ORM and other tooling to reduce/avoid glue code.
  - 8.5k stars (least of these three).
- Cons:
  - Implements all functionality itself, cannot harness community middeleware for existing web libraries, ORMs, etc.
  - No GraphQL support.

### Use an existing framework: LoopBack

"LoopBack is a highly-extensible, open-source Node.js framework that enables you to create dynamic end-to-end REST APIs with little or no coding."

LoopBack was created by a group at IBM, and is used at some large companies including Symantec. Of all three choices this one is most clearly aimed at making OpenAPI based API's as simple and powerful as possible.

- Pros:
  - Includes modern application approaches with an Inversion-of-Control container for DI.
  - Built on top of Express, one of the most popular node web libraries.
  - Extensive documentation and excellent built-in's for API development with OpenAPI.
  - ~ 13k stars on LoopBack 3, 3k on LoopBack 4 (Medium to Least popular depending on version).
- Cons:
  - LoopBack 4 has differences from LoopBack 3 and doesn't seem to be in as widespread of use.
  - GraphQL support via unique OpenAPI to GraphQL bridge approach (see https://loopback.io/openapi-to-graphql.html). Requires API to exist as OpenAPI first.
