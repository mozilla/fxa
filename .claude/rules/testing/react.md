---
paths:
  - "**/*.test.tsx"
---

# FXA React Test Rules

Applies whenever you read or edit a React component test (`*.test.tsx`) anywhere in FXA. Stacks on top of `.claude/rules/testing/base.md`, which covers the general FXA testing rules (naming, mocking, isolation, async, assertions). This file adds the rules specific to component tests.

---

## 1. Query like a user, not by implementation detail

Tests should select elements the way a user finds them. Reach for Testing Library queries that mirror screen-reader / keyboard / visual cues, in this order of preference:

1. `getByRole(name)` — matches accessible role and accessible name
2. `getByLabelText` — form inputs
3. `getByText` / `getByPlaceholderText` / `getByDisplayValue`
4. `getByTestId` — last resort, only when no semantic query fits

**Avoid:** `className` lookups, raw CSS selectors, refs, component instances. These bind tests to the DOM structure rather than the user-facing contract.

```tsx
// Violation — couples test to class name; brittle to CSS refactors
const button = container.querySelector('.submit-btn');

// Violation — testid used when a semantic query fits
const button = screen.getByTestId('submit-button');

// Correct — accessible role + name; mirrors how a user (or AT) finds the button
const button = screen.getByRole('button', { name: /sign in/i });
```

---

## 2. Use `userEvent`, not `fireEvent`

`userEvent` dispatches the full event sequence a real user produces (focus → keydown → input → change → blur). `fireEvent` fires a single synthetic event and misses bugs that depend on the surrounding sequence — focus traps, controlled-input handlers that read from `event.target`, debounced inputs, etc.

```tsx
// Violation — single synthetic event; misses focus / keydown / blur side effects
fireEvent.change(input, { target: { value: 'user@example.com' } });
fireEvent.click(submitButton);

// Correct — full interaction sequence
const user = userEvent.setup();
await user.type(input, 'user@example.com');
await user.click(submitButton);
```

---

## 3. Assert on rendered output, not internals

Component tests should verify what the user sees and can interact with — DOM content, accessible names, ARIA states, presence/absence of elements. Don't reach into `instance()`, `state()`, refs, or private hooks.

```tsx
// Violation — reads private internal state via an Enzyme-style escape hatch
expect(wrapper.instance().state.isSubmitting).toBe(true);

// Correct — asserts the user-observable contract
expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
expect(screen.getByText(/submitting…/i)).toBeInTheDocument();
```

---

## 4. Prefer `findBy*` / `waitFor` over manual `act()`

Most async Testing Library helpers wrap `act()` internally. Reach for them before wrapping state updates in `act` yourself. Manual `act()` is appropriate only when no async helper fits the flow.

```tsx
// Violation — manual act() where findBy would do
act(() => {
  fireEvent.click(button);
});
const message = screen.getByText(/saved/i); // may not be there yet

// Correct — findBy waits and acts internally
await user.click(button);
const message = await screen.findByText(/saved/i);
```

Un-`act`'d state updates produce console warnings and flake — treat the warning as a real failure signal, don't silence it.

---

## 5. Avoid whole-tree snapshots for non-trivial components

Large `toMatchSnapshot()` outputs get regenerated without scrutiny on every change and stop catching regressions. Assert on specific user-observable properties instead: text content, ARIA attributes, presence of specific elements.

Snapshots are still fine for **small, stable, hard-to-articulate output** — e.g., a serialized error message, a generated query string, an SVG path. Pick that case deliberately.

```tsx
// Violation — broad snapshot; reviewers rubber-stamp regenerations
expect(container).toMatchSnapshot();

// Correct — assert what the test actually cares about
expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument();
expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled();
```

---

## 6. Extract provider boilerplate

If every test in the suite wraps the component in the same chain (`MockedProvider`, `IntlProvider`, Router, theme), extract a `renderWithProviders(ui, options)` helper in a test util and reuse it. Inline duplication invites drift — one test gets a tweaked provider config, then assertions diverge for reasons unrelated to the component.

```tsx
// Violation — same provider tree, copy-pasted across every test
render(
  <MockedProvider mocks={mocks}>
    <IntlProvider locale="en">
      <Router>
        <MyComponent {...props} />
      </Router>
    </IntlProvider>
  </MockedProvider>
);

// Correct — one helper, used everywhere
renderWithProviders(<MyComponent {...props} />, { mocks });
```
