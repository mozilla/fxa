# syntax=docker/dockerfile:1

# Shared base for the per-service images. Service Dockerfiles start
# `FROM fxa-base`; docker-bake.hcl and compose.yml wire that name to the
# `fxa-base` stage below.

FROM node:24.21.0-bookworm-slim AS build-utils
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    curl \
    git \
    jq \
    python3 \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /fxa
# The Glean CLI (metrics codegen and lint) runs from this venv.
RUN python3 -m venv .venv \
    && .venv/bin/pip install --no-cache-dir 'glean_parser~=19.0'
ENV HUSKY=0 \
    NX_DAEMON=false \
    NX_NO_CLOUD=true \
    # The yarn cache lives on a BuildKit cache mount, so it cannot be
    # hardlinked into node_modules.
    YARN_NM_MODE=classic

# Install from manifests only, so source edits keep this layer cached.
FROM build-utils AS deps
COPY package.json yarn.lock .yarnrc.yml .nvmrc ./
COPY .yarn ./.yarn
# Run by the root `preinstall` hook.
COPY _scripts/check-package-manager.sh _scripts/check-node-version.sh ./_scripts/
COPY --parents packages/*/package.json ./
RUN --mount=type=cache,target=/root/.yarn/berry/cache \
    yarn install --immutable

FROM deps AS fxa-base
COPY . .
RUN [ -d external/l10n/locale ] || yarn l10n:clone
