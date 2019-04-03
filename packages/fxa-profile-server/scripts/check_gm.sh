#!/bin/sh

if hash gm 2>/dev/null; then
  exit 0
else
  echo "gm (graphicsmagick) not found. must be installed"
  exit 1
fi
