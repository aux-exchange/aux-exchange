#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

gcloud builds submit --pack image=gcr.io/${GOOGLE_CLOUD_PROJECT}/aux-pool-stat --path=${SCRIPT_DIR} --region=us-east1

# gcloud beta run jobs create job-pool-stat-devnet --image gcr.io/${GOOGLE_CLOUD_PROJECT}/aux-pool-stat --args="--firestore-project=driven-rider-375613","--network=devnet"
# gcloud beta run jobs create job-pool-stat --image gcr.io/${GOOGLE_CLOUD_PROJECT}/aux-pool-stat --args="--firestore-project=driven-rider-375613"
