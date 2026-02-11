# Retire the fxa-auth-db-mysql service

- Deciders: Danny Coates
- Date: 2021-03-16

## Context and Problem Statement

In the original architecture for FxA, which was based on the Persona architecture, the database API was on a separate physical layer with more restricted permissions than the web frontend's that served the public API. This separation was deemed unimportant at some point, though the details are probably lost to history, and the db service was moved to be colocated with the auth-server on the frontend servers. New services like graphql-api-server are already making direct db calls via knex in fxa-shared, which auth-server could also use.

## Decision Drivers

- Reduce complexity
- Improve performance
- Share code

## Decision Outcome

We will incrementally expand the fxa-shared db API and use it in auth-server. Once the API implements all the fxa-auth-db-mysql calls we can decomission that service. Doing so will simplify the architecture and maintenance burden, make future changes easier, and should improve service performance.
