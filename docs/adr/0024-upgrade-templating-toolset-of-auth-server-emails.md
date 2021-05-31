# Upgrade the templating toolset of Auth Server emails

- Status: accepted
- Deciders: Yogita Bhatia, Lauren Zugai, Jody Heavener, Vijay Budhram, Ben Bangert, Les Orchard, Danny Coates
- Date: 2021-06-18

Technical Story: [#4627](https://github.com/mozilla/fxa/issues/4627) / [#8600](https://github.com/mozilla/fxa/issues/8600)

## Context and Problem Statement

[Handlebars](https://www.npmjs.com/package/mustache), an extension of [Mustache](https://www.npmjs.com/package/mustache) ([see the differences](https://github.com/handlebars-lang/handlebars.js#differences-between-handlebarsjs-and-mustache)) used in `fxa-auth-server` email templates, can accommodate very limited logic in its templates which has been a pain point for Firefox Accounts engineers and discussion around using a different templating system [began here](https://github.com/mozilla/fxa/issues/4627). While converting our emails to a more modern templating solution, there is an opportunity to evaluate what stack would be the most ideal for FxA emails beyond a proposed templating solution. This includes evaluating our CSS options, improving how we can preview emails in various states, and our localization tools, and the best approach for landing new templates in production.

## Decisions and Considered Options

### Templating and Styling

- Option A - Continue to use Mustache and ad-hoc inline styles
- Option B - Use React server-side to generate static HTML templates with TailwindCSS
- Option C - Use EJS and MJML, using CSS options offered by MJML

### Email previewing

- Option A - Continue to use the `write-emails` command
- Option B - Use Storybook
- Option C - Use Mailtrap

---

Furthermore, there are a few **other decisions** worth noting that won’t necessarily have pros/cons lists:

- How to handle generating plaintext versions
- Transitioning to Fluent over GetText for localization
- Plans around integration involving feature flagging and the QA process

## Decision Outcomes

### Templating and Styling

Chosen option: "Option C - Use EJS and MJML, using CSS options offered by MJML", because:

- HTML email has a lot of quirks - MJML shifts the burden of maintaining solutions for these off of FxA engineers now and in the future
- While we use React and Tailwind in other parts of FxA, React is heavy for an email solution since no state is involved, component reuse across FxA would likely be very minimal, and it involves a more complex build setup than EJS
- MJML helps significantly with responsiveness in emails, reducing time spent developing templates and making future email redesigns easier

### Email Previewing

Chosen option: "Option B - Use Storybook", because:

- It provides us the flexibility to preview all of the different email states together
- We have a Storybook deployment already in place so hooking it up for `fxa-auth-server` will ensure consistency
- Easy to test and perform QA without needing to touch the codebase
- Support for CSS (whether it's plain old CSS, TailwindCSS or something else)

Note: Along with using storybook to view the various states of the templates, we are also planning on continued support of [Maildev](https://www.npmjs.com/package/maildev) since it has applications beyond just previewing emails.

### Other

**Plaintext files**: We'll use [html-to-text](https://github.com/html-to-text/node-html-to-text) to automatically generate plaintext versions of templates rendered to HTML. There may be a scenario in which the automatically-generated plaintext version does not look exactly how we'd like, in which case we can look into exporting both an MJML _and_ plaintext version of the email from the template file.

**Localization**: We will upgrade the localization tool from GetText to [Fluent](https://github.com/projectfluent/fluent.js) since it's preferred by the l10n team and other FxA front-ends are using it. With our chosen templating option we can make use of Fluent's [`@fluent/dom`](https://github.com/projectfluent/fluent.js/tree/master/fluent-dom) package.

**Integration & QA**: During development templates will be marked as being part of a release group. This could be in the form of a mapped list of template names or some variable associated with the template file. Each group will have a corresponding environment variable flag. When this release group’s flag is enabled any templates that fall under it will be used when generating an email template in that environment; until a template's corresponding release group is enabled it is not used and the old/current template will continue to be served. Release groups will be initially enabled in staging until QA has had an opportunity to thoroughly test and evaluate each template in the group, after which they can be incrementally enabled in production. To give us the most flexibiity we can add a new auth-server configuration value that can control which users email are supported and which email templates are supported for mjml. The auth-server can then expose a feature flag method to check this value and then render the correct template.

### Positive Consequences

- Using MJML abstracts HTML email peculiarities away and handles responsiveness for us
- Allows us to move away from inline CSS during development, and improves style reusability and consistency in template files
- Using EJS allows us to write templates using JavaScript, removing the complexities of custom syntaxes like JSX and Mustache

### Negative Consequences

- The Storybook setup will be much more complex than with a React and Tailwind solution
- Introduces new dependencies, and MJML introduces a small learning curve
- Our email templates have been battle-tested over the years, and this change could introduce potential new bugs across various clients

## Pros and Cons of the Templating and Styling Options

`fxa-auth-server` currently makes use of Mustache along with inline styles to develop email templates. Mustache is a logicless HTML templating framework and has been proven to be super helpful in developing mail components so far, but due to its logicless nature it becomes tedious to include conditional statements in the mail components. Futhermore, when emails are built by the server, we need the styles to be inserted inline since most email clients disregard style tags. However, since inline styles aren't great for consistency and they make maintenance more difficult, we want to pick a solution that lets us use reusable classes during development but when built, can be turned into inline styles The following section will detail upon the various pros and cons of potential libraries/ frameworks that could be used to replace the current templating toolchain.

### Option A - Continue to use Mustache and ad-hoc inline styles

- Description
  - Keep the current setup as is in Mustache with inline styling
- Pros
  - The effort to refactor all the templates would be eliminated for now
  - Mustache is designed to be simple and easy to read
- Cons
  - The logicless nature of Mustache would continue to bother us in the future, forcing logic to occur in the JS when it may be preferred in the template
  - Styles will continue to be inconsistent, hampering the look and feel of the templates, making reusability of the styles very difficult, increasing redundancy since the styles cannot be reused, and inline styles make it nearly impossible to use media queries
  - If we continue to use Mustache for our templates then our front-end frameworks in FxA would continue to be different. We currently have Backbone in the content-server, Mustache in the auth-server, and React everywhere else

### Option B - Use React server-side to generate static HTML templates with TailwindCSS

- Description
  - Template the auth server emails using [React](https://reactjs.org/) server-side with TailwindCSS for styling and convert them over to [static HTML templates](https://reactjs.org/docs/react-dom-server.html#rendertostaticmarkup). Other pros and cons of React can be found [in this ADR](https://github.com/mozilla/fxa/blob/main/docs/adr/0010-transition-fxa-from-backbone-to-react.md#option-c---move-to-isomorphic-react), though the type of React we're describing here would be stateless, and a detailed list of pros/cons of using Tailwind are listed [in this ADR](https://github.com/mozilla/fxa/blob/main/docs/adr/0018-use-tailwind-with-custom-scss.md#option-b---use-an-existing-utility-library)
- Pros
  - The logicless nature of the templates will be eliminated once they're refactored in React
  - Storybook integration with React and Tailwind is straightforward since we have it set up in other packages already
  - We already use React and Tailwind in `fxa-settings`, `fxa-admin-panel`, `fxa-payments-server`, and `fxa-react`, reducing the learning curve across the FxA stack
  - Tailwind is highly configurable without being cumbersome, allowing us to modify type and spacing scales, define color ranges, and set up media queries to meet our exact needs and because we have Tailwind setup in other packages, that configuration file could be shared
  - An FxA design guide exists around the Tailwind set up in other packages
  - React offers us many integration options. E.g there is one with [MJML](https://github.com/wix-incubator/mjml-react)
  - React has already been audited by our security team
- Neutral
  - Tailwind classes can be compiled down into inline styles with the help of [juice](https://github.com/Automattic/juice) library
  - There’s potential to cross-share components with the new email templates, however, we might not be able to share as many components because of the email quirks
- Cons
  - It is overkill and atypical to use React for emails, since the library comes with far too many features which may not be needed for templating
  - The templates in the `fxa-auth-server` do not contain heavy business logic so building them with a frontend-heavy framework like React might complicate things
  - Since we will be converting React components with Tailwind into static HTML pages with inlined styles, the build pipeline is complex and it's likely new dependencies would be added to the project

### Option C - Use EJS and MJML, using CSS options offered by MJML

- Description
  - Template the auth server mail components using [EJS](https://ejs.co/) and [MJML](https://mjml.io/). EJS is a simple templating solution that allows the use of logic, and MJML is a component-based library that extracts away HTML email oddities, handles responsiveness for us, and has its own pre-built components as well as gives us the ability to define custom components which compile to responsive HTML after compilation
- Pros
  - EJS is a simple templating engine and far easier to use with it's logic and syntax similar to Javascript and since we want to keep our mail templates straightforward, using it as a templating framework over Mustache or React could be a good choice
  - MJML has been created by keeping in mind all the industry standards as well as the quirks of old email clients, so we will eventually be saving time on investigating cross-browser compatibility of our templates
  - MJML can help us create responsive emails using mobile-first approach and it controls that responsiveness automatically needing very less to no developer intervention
  - MJML has by far the highest weekly downloads and github stars in comparison to its alternatives like [Foundation for Emails](https://github.com/foundation/foundation-emails)
  - The build pipeline is more straightforward than the React and Tailwind option
  - MJML provides us with a built-in `mj-style` tag to define global styles. It also provides `mj-attributes` and `mj-class`, which can be defined and imported across templates for greater reusability
- Cons
  - Adds new dependencies to the stack, and our front-end stacks in FxA will continue to differ
  - Creates a slight learning curve
  - While we may not have much component reuse between other packages that use React/Tailwind anyway, using EJS and MJML in email components would eliminate reuse potential with other packages
  - The Storybook setup will be much more complex than a React and Tailwind solution
  - Use of `mj-style` can sometimes require `!important` declarations to override default MJML styling

## Pros and Cons of the Email Previewing Options

It’s notoriously difficult to preview what different email states look like in FxA for Engineering, Design, and Product. Currently, we're manually previewing the templates by running `yarn write-emails` in the `fxa-auth-server` root directory which doesn't account for states unless we manually change variables and run the command again. Furthermore, even the Maildev client requires us to manually trigger the email when running FxA locally so we need a robust solution to account for these challenges faced by the team.

### Option A - Continue to use the `write-emails` command

- Description
  - Continue exclusively using the `yarn write-emails` command to generate and preview email templates
- Pros
  - Emails are guaranteed to be up-to-date whenever you run the command
  - The effort to refactor all the templates would be eliminated for now
- Cons
  - With this approach, we cannot preview the various email states simultaneously and it requires us to manually change the variables and trigger the command again
  - The script associated with the `write-emails` command can break if we add/remove imports for `senders`

### Option B - Use Storybook

- Description
  - Use [Storybook](https://storybook.js.org/) to preview the email templates
- Pros
  - With this approach we can preview all of the different email states simultaneously
  - Storybook deployment has worked great so far for a few other FxA services so hooking it up for `fxa-auth-server` to view the modernized components might result in consistency
- Cons
  - We're still going to be seeing an HTML version of the email in Storybook that may look different in a web client, however, we could mitigate that by previewing it in Maildev
  - When deployed, Storybook previewing requires the service to be hosted somewhere in GCP and might have some maintenance requirements in future.

### Option C - Use Mailtrap

- Description
  - [Mailtrap](https://mailtrap.io/) is an online tool for safe email testing in dev and staging environments. It is frequently used as a fake SMTP server to catch test emails, view them in virtual inboxes, and debug before sending to real users
- Pros
  - Mailtrap provides us the functionality to view all Bcc’d addresses to verify whether they stay invisible for the main message recipients
  - It can let us view several test results at once like HTML preview, HTML and CSS validation and also outputs the line of code where errors are found
  - With Mailtrap's automatic and manual email forwarding, we can share our testing results with fellow team members either by sending them manually or automatically by setting a list of forwarding rules
- Cons
  - Mailtrap is a paid service, which may be limiting to external contributors
  - Mailtrap is an external/online service, requiring an internet connection to use

## Links

- [Create a new React app for Settings Redesign](https://github.com/mozilla/fxa/blob/main/docs/adr/0011-create-new-react-app-for-settings-redesign.md)
- [React](https://reactjs.org/)
- [Mustache](https://www.npmjs.com/package/mustache)
- [EJS](https://ejs.co/)
- [MJML](https://mjml.io/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Maildev](https://www.npmjs.com/package/maildev)
- [Storybook](https://storybook.js.org/)
- [Mailtrap](https://mailtrap.io/)
