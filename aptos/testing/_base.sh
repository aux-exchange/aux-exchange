#!/usr/bin/env bash

set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

cd $SCRIPT_DIR

mkdir -p base-container/build

go build -o base-container/build/setup-aux github.com/aux-exchange/aux-exchange/go-util/aptos/cmd/setup-aux

# Build outside of the container since the container is limited on threads.
cd $SCRIPT_DIR/../contract/deployer
rustup target add x86_64-unknown-linux-gnu
out=$(cargo build --bin create-resource-account-and-publish --target=x86_64-unknown-linux-gnu --message-format=json)
artifact=$(printf "$out" | tail -n 2 | head -n 1 | tr -s ',' '\n' | grep executable | cut -d '"' -f4)
cp $artifact $SCRIPT_DIR/base-container/build/

cd $SCRIPT_DIR/../api/aux-ts
yarn install

cd $SCRIPT_DIR
podman build base-container --tag aux.exchange/aux
podman build test-container --tag aux.exchange/test
