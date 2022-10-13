#!/usr/bin/env bash

set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

$SCRIPT_DIR/_base.sh

cd $SCRIPT_DIR

podman run --ulimit host -it --rm -v $SCRIPT_DIR/../../:/root/aux-exchange/:Z aux.exchange/aux
