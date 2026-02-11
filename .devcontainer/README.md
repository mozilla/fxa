# DevContainer Setup

This directory contains the configuration files for a development container specifically designed for this project.

## What are Dev Containers?

Dev Containers are Docker containers that provide a pre-configured development environment with all the tools and dependencies you need to get started quickly. This eliminates the need for manual setup on your local machine and ensures consistency across development environments.

## Recommended Setup

[VS Code has extensions](https://code.visualstudio.com/docs/devcontainers/containers) providing support for both local dev containers as well as remote dev containers over SSH and is the recommended IDE for working with the Accounts code-base. Additional extensions are recommended when loading this repository that help with development tasks.

Windows, MacOS, or Linux may all be used with this setup, see the [VS Code system requirements(https://code.visualstudio.com/docs/devcontainers/containers#_system-requirements)] for setting up the system.

## Customizing the Dev Container

Dev Containers can be [customized to your preferences using dotfiles](https://code.visualstudio.com/docs/devcontainers/containers#_personalizing-with-dotfile-repositories). Dotfiles are hidden configuration files (starting with a dot ".") that define settings for various tools like your shell, editor, and version control system.

Here's how to learn more about dotfiles:

- [Introduction to Dotfiles](https://dotfiles.github.io/)

By placing your dotfiles in this directory, they will be automatically copied to your development container and applied when the container starts.

## Performance on Windows / MacOS

Because the default VS Code approach is to perform the git checkout on the local system, then [volume bind](https://code.visualstudio.com/remote/advancedcontainers/improve-performance) it into the dev container, file performance (especially `yarn install`) may be quite slow.

As a consequence, its **highly recommended** to use an isolated container volume for the git checkout, this is available as the `Dev Containers: Clone Repository in Container Volume... ` option in VS Code.
