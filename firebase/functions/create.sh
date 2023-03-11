#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

gcloud functions deploy copy-pool-stat-to-storage --entry-point CopyPoolStatToStorage --runtime go119 --trigger-event "providers/cloud.firestore/eventTypes/document.write" --trigger-resource "projects/${GOOGLE_CLOUD_PROJECT}/databases/(default)/documents/pools/stat" --region=us-east1 --set-env-vars GOOGLE_CLOUD_PROJECT=${GOOGLE_CLOUD_PROJECT} --source=${SCRIPT_DIR}
