#!/usr/bin/env bash

set -euo pipefail

node scripts/check-local-config

CONFIG_FILES=server/config/local.json,server/config/fxaci.json grunt server
