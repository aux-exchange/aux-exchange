#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

gcloud storage buckets update gs://driven-rider-375613.appspot.com --cors-file=${SCRIPT_DIR}/cors.json
