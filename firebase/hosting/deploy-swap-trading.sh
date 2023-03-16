#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

cmd="cd ${SCRIPT_DIR}/../.. && firebase deploy --only hosting:swap-trading"

bash -c "${cmd}"
