# React Toolchain for Settings Redesign

- Status: accepted
- Deciders: Jody Heavener, Lauren Zugai, Les Orchard
- Date: 2020-04-13

## Context and Problem Statement

Firefox Accounts is introducing a new visual design for Settings (the interface that exists at the address `https://accounts.firefox.com/settings`). The changes involved are significant enough such that it [has been decided](https://github.com/mozilla/fxa/blob/master/docs/adr/0011-create-new-react-app-for-settings-redesign.md) that an entirely new React App will be built more or less independent of the existing Settings web app. With this we can beta test and roll out the new design with minimal disruption.

As there are a multitude of ways a React App can be set up and configured, this decision has introduced the question, "What [toolchain](https://en.wikipedia.org/wiki/Toolchain) should we set up a new React App with?". This ADR serves to answer that question by going over the various approaches we can take to set up a new React App and how it might integrate with our existing FxA ecosystem.

It's important to note that we are not deciding the languages, libraries, or other tools that we will use within the React development environment, but rather, the system that will be used to develop the React App with.

Finally, we are not making decisions about the App's production server here. We'll be using [fxa-content-server](https://github.com/mozilla/fxa/tree/master/packages/fxa-content-server/server)'s Express server for the production build.

## Decision Drivers

- **Familiarity** - unless there is an overwhelming reason, we don't really want to introduce a completely foreign build process for everyone to learn.
- **Configurability** - if it is less configurable does it meet our needs; if it is more configurable is the time spent worth it?
- **Maintainability** - how much work do we set up for ourselves if we're maintaining all upgrades and configuration?

Additionally, our team has a desire to share React components and other files across projects. Both the Payments and Admin Panel web apps use React, and we would benefit from being able to develop components that could be imported into any of these React Apps.

## Considered Options

- Option A - Completely Custom Approach
- Option B - Create React App
  - Option B2 - Create React App and immediately eject
  - Option B3 - Create React App and use Rescripts
- Option C - Neutrino with React Preset
- Option D - Other Considerations

## Decision Outcome

Chosen option: "B3 - Create React App and use Rescripts", because:

- Our team has sufficient knowledge in working with CRA over the other options.
- We don't need to re-invent the wheel. Our needs for the Settings project are not so great that it would be worth spending time creating a ground-up toolchain. To some extent this option allows us to do what we do best without needing to worry about the specifics of the development workflow.
- Rescripts allows us to layer additional configuration overtop of the existing configuration without jeopardizing the integrity or trading away any of the powers of CRA. Specifically, we can use Rescripts to modify CRA to allow external React components to be imported, as demonstrated in [this repo](https://github.com/jodyheavener/rescripts-react-app) (technical notes [here](https://github.com/jodyheavener/rescripts-react-app/blob/master/.rescriptsrc.js)). This capability could be implemented in our other React Apps.
- If, down the road, we end up in a place where we absolutely need access to the internals we can always eject.

## Pros and Cons of the Options

### Option A - Completely Custom Approach

- Description
  - Manually create a custom toolchain tailored to our exact specifications. This would likely include a Webpack setup that includes configuration for Babel, any Babel plugins for React, ReactDOM, ES6, SCSS, JSX, and any setup/cleanup tools.
- Pros
  - We could craft a toolchain that does exactly what we need it to, without any additional technical baggage or clutter.
  - Is much easier to introduce changes or new steps/actions to the build process.
  - No restrictions when it comes to importing components or other files from outside the project's root directory.
- Cons
  - Would require extensive setup time in order to be beneficial over other options.
  - Would require team-wide decisions to be made around setup, which could result in longer setup time (or even additional ADRs).
  - Maintenance, bug fixes, and dependency updates fall entirely on our team.
  - We'd need to manually add our own live-reloading process.

### Option B - Create React App

- Description
  - Use [Create React App](https://github.com/facebook/create-react-app) to generate a no-build-configuration toolchain.
- Pros
  - It is famously "no configuration", which allows you to get started much quicker. Generally removes the need for our team to decide on each individual aspect.
  - Comes with support for the languages and tools our team is already familiar with, such as SCSS, Babel, and JSX.
  - Comes with Hot Module Reloading.
  - We always have the option to eject, which would allow us to expose all configuration and build processes. While this is permenent, it is still an option, whereas if we start with a custom build we do not have the ability to reverse-eject into a managed state.
  - Is an "official" tool that is very actively maintained and has a large community.
- Cons
  - It is famously "no configuration", which means without some additional tooling you can't directly access the Webpack configuration or perform any major customization to the build process.
  - Create React App restricts imports to the immediate directory and any sub-directories. This means that we would be unable to import shared components.

#### Option B2 - Create React App and immediately eject

- Description
  - Start with Option B, and then immediately execute `npm run eject` in order to expose all configuration and build processes.
- Pros
  - You are still given a setup that you can immediately work with.
  - You can modify configurations or build processes as you see fit.
- Cons
  - You are removed from the managed state that Create React App is designed to provide. Maintenance, bug fixes, and dependency updates would fall entirely on our team.

#### Option B3 - Create React App and use Rescripts

- Description
  - Start with Option B, and additionally add [Rescripts](https://github.com/harrysolovay/rescripts) to allow us to modify the setup.
- Pros
  - Use and customize parts of Create React App, such as te Webpack config, without needing to eject, fork, or otherwise modify core CRA functionality.
- Cons
  - Not an officially supported approach, so we could run into issues that React or create-react-app might not be able to remedy.

### Option C - Neutrino with React Preset

- Description
  - Use [Neutrino](https://neutrinojs.org/) and its [React Preset](https://neutrinojs.org/packages/react/) to set up a no-upfront-configuration toolchain.
- Pros
  - Provides many of the same initial configuration assumptions, tools, and out-of-the-box setup as Create React App.
  - Appears to have better support for cross-project component sharing.
- Cons
  - Our team has little experience with this tool.
  - Is not an "official" tool (though is fairly actively maintained), and has considerably smaller community than Create React App.

### Option D - Other Considerations

There is no shortage of options when it comes to creating a toolchain for your React app. Here are some additional tools and frameworks that were considered when making this decision:

- [Next.js with React](https://nextjs.org/) - generally not applicable to us as we are not looking at server-side rendering. However, Firefox Private Network does use this.
- [React App Rewired](https://github.com/timarney/react-app-rewired) - as of Create React App 2.0 this project is only being lightly maintained.
- [Gastby with React](https://www.gatsbyjs.org/) - generally not applicable to us as we require more than static web pages.
- [Parcel with React Recipe](https://parceljs.org/)
- [nwb with React skeleton](https://github.com/insin/nwb)

## Additional Links

- [ADR "Create a New React Application for the Settings Redesign Project"](https://github.com/mozilla/fxa/blob/master/docs/adr/0011-create-new-react-app-for-settings-redesign.md)
- [ADR "Transition FxA from Backbone to React"](https://github.com/mozilla/fxa/blob/master/docs/adr/0010-transition-fxa-from-backbone-to-react.md)
- [Settings Product Requirement Document](https://docs.google.com/document/d/18zu7JCYIsUp8tUMJqb2uErNlzL9f6CQvefLy9HFZ4UY/edit?pli=1)
- [Official React toolchain recommendations](https://reactjs.org/docs/create-a-new-react-app.html)
