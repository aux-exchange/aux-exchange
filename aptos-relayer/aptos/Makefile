
APTOS_DEVNET_NAME := devnet
APTOS_TESTNET_NAME := testnet
APTOS_MAINNET_NAME := mainnet
AUX_RELAY_SEED := aux_eth_relay_test10
AUX_RELAY_RESOURCE_ADDRESS := $(shell worm aptos derive-resource-account $(RELAY_DEPLOYER) $(AUX_RELAY_SEED))

ifeq ($(DEPLOY_NETWORK), $(APTOS_DEVNET_NAME))
	NAMED_ADDRS :=aux_eth_relay=$(AUX_RELAY_RESOURCE_ADDRESS),aux=0xea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a,aux_deployer=default
else ifeq ($(DEPLOY_NETWORK), $(APTOS_TESTNET_NAME))
	NAMED_ADDRS :=aux_eth_relay=$(AUX_RELAY_RESOURCE_ADDRESS),aux=0x8b7311d78d47e37d09435b8dc37c14afd977c5cfa74f974d45f0258d986eef53,aux_deployer=default
else ifeq ($(DEPLOY_NETWORK), $(APTOS_MAINNET_NAME)) 
	NAMED_ADDRS :=aux_eth_relay=$(AUX_RELAY_RESOURCE_ADDRESS),aux=0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541,aux_deployer=default
else 
	$(error DEPLOY_NETWORK must be set to one of $(APTOS_DEVNET_NAME), $(APTOS_TESTNET_NAME), or $(APTOS_MAINNET_NAME))
endif

.PHONY: deploy deploy-deployer
deploy:
	worm aptos deploy-resource $(AUX_RELAY_SEED) --network $(DEPLOY_NETWORK) . --named-addresses $(NAMED_ADDRS)

deploy-deployer:
	worm aptos deploy ../../aptos/contract/deployer --network $(DEPLOY_NETWORK) --named-addresses $(NAMED_ADDRS)