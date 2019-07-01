# Custom Elements

Contents of this directory are to define custom element helpers
for view elements. Each module should define at minimum two functions:

`match` - check whether the current module should be used with the given element.
`validate` - validate the element. `throw` the validation error if invalid.

An additional function can also be overridden:

`val` - override \$el.val() for the specific use case. When overriding, be sure
to take care of both get and set. The original element's `val` function is
available at `__val`.
