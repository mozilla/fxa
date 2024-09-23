#!/bin/bash -e

echo "Converting folder $1 to cjs!";

echo "About to convert:"
find $1 -type f -iname "*.js";

read -p "Continue? (Y/N): " confirm && [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]] || exit 1

# Assumes you have this repo checkedout next to fxa
find $1 -name "*.js" | xargs jscodeshift -t ../commonjs-to-es-module-codemod/dist/index.js
