include testing.env

.PHONY: dependencies unit-test forge-test integration-test clean all deploy deploy-dev

all: build

.PHONY: clean
clean:
	rm -rf anvil.log node_modules lib out

.PHONY: dependencies
dependencies: node_modules lib/forge-std

node_modules:
	yarn

lib/forge-std:
	forge install foundry-rs/forge-std --no-git --no-commit

build: dependencies
	forge build

.PHONY: unit-test
unit-test: forge-test

.PHONY: forge-test
forge-test: dependencies
	forge test --fork-url ${TESTING_FORK_RPC} -vv

.PHONY: integration-test
integration-test: dependencies build
	bash shell-scripts/run_integration_tests.sh

.PHONY: test
test: forge-test integration-test

.PHONY: deploy-dev
deploy-dev:
	forge script forge-scripts/deploy_contracts_test.sol:ContractScript --broadcast --rpc-url ${GOERLI_RPC_URL}

.PHONY: transfer-dev
transfer-dev:
	forge script forge-scripts/send_token_transfer_test.sol:ContractScript --broadcast --rpc-url ${GOERLI_RPC_URL}

.PHONY: attest-dev
attest-dev:
	forge script forge-scripts/attest_token_test.sol:ContractScript --broadcast --rpc-url ${GOERLI_RPC_URL}

.PHONY: deploy
deploy:
	forge script forge-scripts/deploy_contracts.sol:ContractScript --broadcast --rpc-url ${RPC_URL}