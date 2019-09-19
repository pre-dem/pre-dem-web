#!/bin/bash
set -o errexit
set -o nounset

tagName="v$(jq '.version' package.json | sed "s/\"//g")"

# check if tag aleady exists
if [[ -n $(git ls-remote --tags origin $tagName) ]]; then
  echo "tag $tagName already exists, skip release"
  exit 0
fi

# install deps & do compile
yarn
mv ./src/main.ts ./src/index.ts
npm run compile

# move compile result out
rm -rf ./src
mv ./dist ./lib
mv -f .gitignore_for_release .gitignore

# remove dist folder
rm -rf ./dist

# commit & push
git add --all .
git commit -m "build"
git tag -a $tagName -m "built by script"
git push mine $tagName
