#!/bin/bash -e

if [[ "${npm_execpath:(-4)}" != "yarn" ]]; then
  if [[ ! $(command -v yarn) ]]; then
    echo -n "install yarn now? [y/n]: "
    read -rn 1 ans
    printf "\n"
    if [[ $ans == "y" ]]; then
      npm i -g yarn
    fi
  fi
  echo -e "\n##################################################\n"
  echo "please use 'yarn install' instead of 'npm install'"
  echo -e "\n##################################################\n"
  exit 1
fi
