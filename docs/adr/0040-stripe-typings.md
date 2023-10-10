# Stripe Typings Management Strategy

- Status: accepted
- Deciders: Julian Poyourow, Ben Bangert, Reino Muhl
- Date: 2023-10-09

## Context and Problem Statement

The Stripe typings create frequent challenges for the SubPlat team. SubPlat 2.0's StripeHelper contains a number of typecasts, which not only introduce potential runtime bugs, but make it harder to reuse code without knowing internal implementation details.

In an ecosystem where we want to move to libraries that encapsulate complexity and be consumers of our own libraries, we need a strong foundation for typings that give us predictable behavior given a set of inputs.

## Decision Drivers

- We want a performant solution
- We want a solution that gives us a reasonable amount of type-safety
- We want a solution that does not introduce significant mental overhead & complexity

## Considered Options

- Option A, full set of generics overriding Stripe's default typing system
- Option B, leverage a library as a wrapper for Stripe, exporting our own custom types from the library
- Option C, disable/block usage of Stripe's `expand` property
- Option D, always query with all fields expanded
- Option E, throw errors/assert when a helper receives an unexpected value to narrow the type

## Decision Outcome

Chosen option: Option C with a fallback to option E.

Option C is the best blend of options, and does not have major drawbacks in maintenance costs and complexity.

Option E, is the best alternative if we experience issues implementing option C, because it is low cost and does not introduce costly maintenance and complexity that are infeasible for the team.

Both Option C would be faciliated by creating a Stripe library that will wrap all calls to Stripe, and apply the correct type util to the Stripe type. Our custom types would live in this library as well.
Should we need to fall back to Option E, the assertion util would also live in this Stripe library.

## Pros and Cons of the Options

### Option A, full set of generics overriding Stripe's default typing system

Description:

- Create a full set of generics and override the default Stripe return types in a stripe.d.ts file.
- Our application would work with types such as `Stripe.Subscription<Stripe.Customer>`. Calls to Stripe would be generic and would infer the return type based on the `expanded` property passed.
- A small wrapper library would be required to separate out the definitions for `_id` fields.
  - Types-only implementation would probably not be enough, since with types only a function that requires `Stripe.Subscription<Stripe.Customer>` could not be passed `Stripe.Subscription<Stripe.Customer & Stripe.PaymentMethod>` since the `default_payment_method` property would not be a compatible type.
  - This would require us to have a small wrapper library that separates out the `_id` type into a separate field.

Pros and cons:

- Good, because it's the nicest API to interact with, and is what we wish Stripe originally provided out of the box.
- Bad, because it obfusticates our interaction with the Stripe.js, since Stripe does not truly return these types.
- Bad, because we have to create a library to map properties from Stripe.js's response.
- Bad, because it's a tremendous amount for us to take on and maintain over time.
- Bad, because it's likely overkill for our use-case.

### Option B, leverage a library as a wrapper for Stripe, exporting our own custom types from the library

Description:

- In our own Stripe lib, cast Stripe results to our own types on top of the response type set. We then can work with our own defined subset of typings that fully encapsulate Stripe's typings.
- Our application would work with types such as `Subscription<Customer>` where Customer and Subscription are both types that are defined and maintained by us, and come from the Stripe lib in our own codebase.

Pros and cons:

- Good, because it solves the obfustication issue with Stripe.js.
- Good, because it's still a very nice API to interact with.
- Good, because it maintains our ability to use the `expand` property.
- Bad, because we have to create a library to map properties from Stripe.js's response.
- Bad, because it's quite a bit to maintain.
- Bad, because it's likely overkill for our use-case.

### Option C, disable/block usage of Stripe's `expand` property

Description:

- Never use expanded properties.
- Create a generic that infers that the provided properties are actually of type `string | null`.
- Can override Stripe's types to specify that the `expand` property is not used, though this would add additional complexity and is not specifically necessary for this option.
- All application behavior uses expanded properties that are always `string | null`.
- Our application could work with normal Stripe types such as `Stripe.Subscription` and `Stripe.Customer`
  - We either need to:
    - Override these Stripe types in a stripe.d.ts file (somewhat complex) to contain only the non-expanded types for the associated properties.
    - Wrap calls to Stripe and return/override the return type with a generic that narrows the type for specified properties to contain only the non-expanded types for the associated properties.

Pros and cons:

- Good, because it's the least effort.
- Good, because it matches our needs.
- Bad, because we can't use expand, and would need to cast to `any` in the unlikely/unusual case where we _absolutely need_ to use `expand`.

### Option D, always query with all fields expanded

Description:

- Require that all properties be expanded at all times.
- Create a generic that infers that any property that would be expanded is actually of type "string".
- All application behavior uses expanded properties that are always the expanded type.
- Our application would work with the normal Stripe types such as `Stripe.Subscription` and `Stripe.Customer`, but where both have been overridden via a stripe.d.ts file to contain only the expanded types for the associated properties.

Pros and cons:

- Good, because we always have all of the data expanded for all fields.
- Bad, because we expect major performance issues and Stripe does not recommend this behavior.

### Option E, throw errors/assert when a helper receives an unexpected value to narrow the type

Description:

- Use the Stripe library as normal.
- Document in the associated function signature that a given method needs specific properties expanded.
- Assert using a utility that a given property is present with the needed props, which narrows the type if the assertion passes.

Pros and cons:

- Good, because it's zero-effort.
- Bad, because there's no compile-type validation.
- Bad, because this is an escape-hatch from TypeScript and does not provide us type validation.
- Bad, because it's likely authors _will_ miss required expanded props for a given method, and cause runtime errors.
- Bad, because it's likely there will be instances where devs end up in situations where they end up with an expanded property in-hand due to external forces, but need to call a method that requires a non-expanded property or vice-versa.
