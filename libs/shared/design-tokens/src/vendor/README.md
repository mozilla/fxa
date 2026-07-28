# Vendored Nova source

The generator (`../generate.mjs`) reads Nova's **compiled** design-system CSS from this
directory. We vendor a copy (rather than depending on a local `mozilla-central` checkout)
so token generation is reproducible and diffable across machines and CI.

Expected files:

- `tokens-shared.css` — Nova base + component tokens (both surfaces)
- `tokens-brand.css` — the in-content "brand" layer that completes the shared set
- `SOURCE` — provenance: the `mozilla-central` revision these were copied from

## Refresh ("sync") process

These are copied verbatim from mozilla-central's compiled output:

```
mozilla-central/toolkit/themes/shared/design-system/dist/tokens-shared.css
mozilla-central/toolkit/themes/shared/design-system/dist/tokens-brand.css
```

To update to a newer Nova:

1. Copy the two `dist/*.css` files here, overwriting the existing ones.
2. Record the source revision in `SOURCE` (hg/git hash + date).
3. Re-run the generator (`nx run shared-design-tokens:generate`) and review the diff of
   `../../generated/nova-tokens.css` in Storybook before landing.

## Bootstrap without vendoring

For the first pass you can point the generator at a local Firefox checkout instead of
vendoring:

```
NOVA_SRC=../../../../firefox/toolkit/themes/shared/design-system/dist \
  node src/generate.mjs
```

Do NOT hand-edit these files — they are upstream artifacts.
