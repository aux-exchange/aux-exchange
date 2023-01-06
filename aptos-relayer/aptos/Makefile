
APTOS_DEVNET_NAME := devnet
APTOS_TESTNET_NAME := testnet
APTOS_MAINNET_NAME := mainnet
AUX_RELAY_SEED := aux_eth_relay_test11
AUX_RELAY_RESOURCE_ADDRESS := $(shell worm aptos derive-resource-account $(RELAY_DEPLOYER) $(AUX_RELAY_SEED))

ifeq ($(DEPLOY_NETWORK), $(APTOS_DEVNET_NAME))
	NAMED_ADDRS :=aux_eth_relay=$(AUX_RELAY_RESOURCE_ADDRESS),aux=0xea383dc2819210e6e427e66b2b6aa064435bf672dc4bdc55018049f0c361d01a,aux_deployer=0x52746eee4d2ecc79f940f617d1e98f885467c185e93a444bc6231a8b1960c48a
else ifeq ($(DEPLOY_NETWORK), $(APTOS_TESTNET_NAME))
	NAMED_ADDRS :=aux_eth_relay=$(AUX_RELAY_RESOURCE_ADDRESS),aux=0x8b7311d78d47e37d09435b8dc37c14afd977c5cfa74f974d45f0258d986eef53,aux_deployer=0x27a5ed998335d3b74ee2329bdb803f25095ca1137015a115e748b366c44f73be
else ifeq ($(DEPLOY_NETWORK), $(APTOS_MAINNET_NAME)) 
	NAMED_ADDRS :=aux_eth_relay=$(AUX_RELAY_RESOURCE_ADDRESS),aux=0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541,aux_deployer=0x5a5e124ea1f3fc5fcfae3c198765c3b4c8d72c7236ae97ef6e5a9bc7cfda549c
else 
	$(error DEPLOY_NETWORK must be set to one of $(APTOS_DEVNET_NAME), $(APTOS_TESTNET_NAME), or $(APTOS_MAINNET_NAME))
endif

.PHONY: deploy deploy-deployer
deploy:
	worm aptos deploy-resource $(AUX_RELAY_SEED) --network $(DEPLOY_NETWORK) . --named-addresses $(NAMED_ADDRS)

deploy-deployer:
	worm aptos deploy ../../aptos/contract/deployer --network $(DEPLOY_NETWORK) --named-addresses $(NAMED_ADDRS)