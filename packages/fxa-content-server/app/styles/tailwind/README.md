# Tailwind in fxa-content-server

current as of 2022-07-26

FxA's front-ends either use Tailwind (TW) or will be using Tailwind in near the future. We plan to convert the content-server over to a similar stack to `fxa-settings`, which includes React and Tailwind.

To make the stack conversion easier and to get a head start on making FxA's styles consistent, any design tweaks in the content-server should reference Tailwind classes if at all possible. This should be done with care.

If you're adding Tailwind styles:

- Be sure to inspect the elements and make sure only Tailwind styles (utility classes preferably) are applied as much as possible. You’ll have to remove some old SCSS targeted with selectors or else they’ll override your utility classes but do so carefully and be sure to refactor other mustache files that would match those selectors.
- At the time of writing, `tailwind.out.css` isn't added to every content-server’s `index.html` file. If/when we reskin other error pages or `privacy.html` we'll need to include it there too.
- At the time of writing, all Tailwindified files have removed the ID `#main-content` in its mustache files. This is only serving stylistic purposes so please remove this when you touch the file.

Whenever content-server is converted to Tailwind we can consider extending the `link-blue` class to all `a` elements as our default for links, then override with `link-blue` where needed.

## Component classes

Component classes should live in this `tailwind` directory for organization purposes but when we're no longer using SCSS we can move these styles out of the directory. **Don't use SCSS in component class files** because while we have to keep the build step at the moment for old SCSS files, we'll want to remove it later, and we can use `postcss-import` and `tailwind/nesting` which uses `postcss-nested` under the hood instead.

Component classes (custom `.css`) can usually be avoided by creating reusable _new components/partials_ and applying TW classes on and within that component, [see the TW docs on this](https://tailwindcss.com/docs/reusing-styles#extracting-components-and-partials). This is something to keep in mind when we convert to React since **we should favor new components over [basically writing CSS again](https://tailwindcss.com/docs/reusing-styles#avoiding-premature-abstraction)** - we can remove a lot of the currently existing component classes following that philosophy.

Only use `@apply [tailwind-classes]` in component classes if possible. Nesting element styles within TW is also not preferred since single-element specificity matches the utility pattern and it makes [using layer directives](https://tailwindcss.com/docs/functions-and-directives#layer) easier, but is sometimes unavoidable. It will be necessary in some spots as a "hack" until content-server uses React because currently our Backbone JS files can insert DOM elements containing HTML, and we'd need to 1) be sure to add classes every instance and 2) add these JS files to content-server's TW "content" option for purging reasons.
