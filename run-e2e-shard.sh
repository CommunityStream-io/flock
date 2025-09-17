#!/bin/bash

# Set up PATH to include local node_modules/.bin
export PATH="./node_modules/.bin:$PATH"

# Run the concurrently command with proper PATH
concurrently --kill-others --success first \
  "ng serve flock-mirage --configuration=test --port=4200 --host=0.0.0.0" \
  "wait-on http://localhost:4200 && cross-env CI=true HEADLESS=true SHARDED_TESTS=true wdio run ${WDIO_CONFIG:-wdio.conf.ts} --shard=${SHARD}/${TOTAL_SHARDS}"
