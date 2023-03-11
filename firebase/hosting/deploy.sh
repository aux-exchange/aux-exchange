#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

cmd="cd ${SCRIPT_DIR}/../.. && firebase deploy --only hosting:landing-page"

bash -c "${cmd}"
