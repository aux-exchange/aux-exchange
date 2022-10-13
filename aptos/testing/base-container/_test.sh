#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR/aux-exchange/aptos/api/aux-ts
APTOS_LOCAL=true yarn test
