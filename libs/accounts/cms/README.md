# @fxa/account-cms

This library provides a Node.js module for managing and fetching CMS (Content Management System) configurations from a Strapi API, with Redis caching for improved performance. It is designed to integrate with the Mozilla Accounts ecosystem and is built using [Nx](https://nx.dev) for a monorepo setup.

## Overview

The `@fxa/account-cms` library enables applications to fetch configuration data from a Strapi CMS instance, specifically for client-specific and entrypoint-specific settings (e.g., UI configurations like headlines and descriptions for different pages). It includes:

- **StrapiClient**: A client for making authenticated HTTP requests to the Strapi API.
- **CMSManager**: A manager class that handles fetching configurations, caching them in Redis, and tracking metrics with StatsD.
- **Error Handling**: Custom error classes for handling Strapi API errors, cache issues, and configuration not found scenarios.

## Building

Run `nx build accounts-cms` to build the library.

## Running unit tests

Run `nx test accounts-cms` to execute the unit tests via [Jest](https://jestjs.io).
