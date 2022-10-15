#!/usr/bin/env bash
# NOTE: This script runs in the container.
# You should not need to run manually.

set -e
cd /root

setup-aux -f -w /root/aux-exchange/aptos/contract

cd /root/aux-exchange/aptos/api/aux-ts
yarn --immutable
