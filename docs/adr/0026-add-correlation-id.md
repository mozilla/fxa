# Add Correlation IDs to FxA Services to Enhance Tracing and Debugging

- Status: proposed
- Deciders: Barry Chen
- Date: 2021-04-28

## Context and Problem Statement

FxA services generate a lot of log messages as well as report errors to Sentry.
However, they are disparate systems with no way of connecting an error in
Sentry to the relevant logs. It would be helpful if the error events include
some form of direct reference to the logs.

Similarly, FxA currently does not offer a way of tracing a client (RP, web
frontend, etc.) request through its services; a reference id that allows FxA
team members to connect the requests that are handled in multiple services as a
result of the domino effect from the client request should be helpful for
debugging.

## Decision Drivers

- Developer experience while tracing and debugging an issue across multiple FxA
  microservices.
- Ability to query relevant log entries for any given error.

## Considered Options

1. Add correlation ids to FxA services.
1. Do nothing.

## Decision Outcome

Chosen option: "Add correlation ids to FxA services", because it

- offers the ability to query service logs for specific entries with
  correlation ids from the error reports
- enables distributed tracing in FxA services

## Pros and Cons of the Options

### Add Correlation IDs to FxA Services

Have FxA services generate or accept correlation ids in their request headers
and use the ids in logs and error responses.

When a client (RP, web frontend, etc.) request arrives on a service, the
service must generate a header named "x-correlation-id" with a [UUID version
4][uuid-rfc] as the value and append it to the request's headers.

For inter-service requests, the client should include the correlation ID as the
"x-correlation-id" header in its request. The receiving service should accept
the header and use the value as its correlation ID. If the sending service
does not include a correlation ID in its request, the receiving service must
generate one for the request.

These correlation IDs will then be included in all log messages and error
response bodies.

Pros

- It will be possible to query service logs with correlation IDs from Sentry error events.
- It will be possible to trace a request through the FxA services.

Cons

- The FxA team needs to add the new header to a mish-mash of frameworks and
  libraries used for the servers and clients.
- An increase in log size and bandwidth usage.
- The number of services in FxA isn't that numerous, so the return on
  investment might not be worth the effort.

### Do Nothing

Pros

- Zero risk.

Cons

- No way of correlating an error event in Sentry directly to log entries.
- No distributed tracing in any form.

[uuid-rfc]: https://tools.ietf.org/html/rfc4122
