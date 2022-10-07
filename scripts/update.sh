#!/bin/bash

export PNPM_HOME="/home/github/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

# setup
mkdir -p /home/github/lennon
cd /home/github/lennon
repo=blxckOxymoron/lennon
NODE_ENV=production

gh auth status
if [ $? -eq 1 ]; then
  echo "Not logged in to GitHub"
  exit 1
fi

# sleep to allow the GitHub Action to finish
echo "Waiting for GitHub Action to finish..."
sleep 10

current=$(cat sha.txt || "")

latestRun=$(gh run list --json headSha,databaseId -R $repo -L 1 -w "Build and Deploy Lennon" -q .[0])

latest=$(echo $latestRun | jq -r .headSha)
id=$(echo $latestRun | jq -r .databaseId)

if [ "$current" != "$latest" ]; then
    echo "New build detected, updating...";
    find . -maxdepth 1 ! -name "_*" ! -name ".*" ! -name "node_modules" -exec rm -r {} +
    gh run download $id -R $repo -n lennon
    pnpm run deploy
    echo "Updated!"
    echo $latest > sha.txt
else
    echo "No new build, skipping download."
fi

pnpm run start