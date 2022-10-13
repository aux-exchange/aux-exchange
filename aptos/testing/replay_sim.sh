#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
$SCRIPT_DIR/_base.sh || exit 1

cd $SCRIPT_DIR || exit 1
podman run --ulimit host -it --rm -v $SCRIPT_DIR/../../:/root/aux-exchange/:Z aux.exchange/aux /bin/bash -itc "/root/_setup.sh && cd /root/aux-exchange/aptos/api/aux-ts && APTOS_LOCAL=true yarn sim:replay"

