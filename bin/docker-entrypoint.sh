#!/bin/sh
set -ea

if [ ! -d "node_modules" ] || [ ! "$(ls -qAL node_modules 2>/dev/null)" ]; then

  echo "Node modules not installed. Installing..."

  if [ -f "yarn.lock" ]; then

    yarn install

  else

    npm install

  fi

fi

exec "$@"
