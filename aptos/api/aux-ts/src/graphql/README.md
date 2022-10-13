# Quickstart

First make sure you're using `Aptos 0.3.8`. Download here: https://github.com/aptos-labs/aptos-core/releases/download/aptos-cli-v0.3.8/aptos-cli-0.3.8-MacOSX-x86_64.zip

Move that `aptos` executable into some place on your path, e.g. `/usr/local/bin`.

Now setup `Go` toolchain. https://go.dev/doc/install

Now `cd` into `aux-ts` and run `yarn test`.

Now startup graphql with `yarn start:graphql`

Now run `yarn metadata`. You should see a bunch of stuff logged with addresses. This will be what
you use to construct queries.


## Placeholder input for all graphql variables. Make sure to change the address.

```json
{
  "createPoolInput": {
    "poolInput": {
      "coinTypeX": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::FakeCoin<0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::ETH>",
      "coinTypeY": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::FakeCoin<0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::USDC>"
    },
    "feePercent": 0.3
  },
  "swapInput": {
    "poolInput": {
      "coinTypeX": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::FakeCoin<0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::ETH>",
      "coinTypeY": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::FakeCoin<0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::USDC>"
    },
    "coinTypeIn": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::FakeCoin<0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::ETH>",
    "coinTypeOut": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::FakeCoin<0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::USDC>",
    "amountIn": 1,
    "minAmountOut": 1200
  },
  "addLiquidityInput": {
    "poolInput": {
      "coinTypeX": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::FakeCoin<0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::ETH>",
      "coinTypeY": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::FakeCoin<0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::USDC>"
    },
    "amountX": 1,
    "amountY": 1
  },
  "removeLiquidityInput": {
    "poolInput": {
      "coinTypeX": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::FakeCoin<0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::ETH>",
      "coinTypeY": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::FakeCoin<0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::USDC>"
    },
    "amountLP": 1
  },
  "createMarketInput": {
    "marketInput": {
      "baseCoinType": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::FakeCoin<0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::ETH>",
      "quoteCoinType": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::FakeCoin<0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::USDC>"
    },
    "baseLotSize": 1,
    "quoteLotSize": 1
  },
  "placeOrderInput": {
    "marketInput": {
      "baseCoinType": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::FakeCoin<0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::ETH>",
      "quoteCoinType": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::FakeCoin<0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::USDC>"
    },
    "sender": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa",
    "side": "BUY",
    "limitPrice": 1300,
    "quantity": 1,
    "auxToBurn": 0,
    "clientOrderId": 42,
    "orderType": "LIMIT"
  },
  "cancelOrderInput": {
    "marketInput": {
      "baseCoinType": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::FakeCoin<0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::ETH>",
      "quoteCoinType": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::FakeCoin<0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::USDC>"
    },
    "sender": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa",
    "orderId": 1
  },
  "depositInput": {
    "coinType": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::FakeCoin<0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::ETH>",
    "sender": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa",
    "amount": 42
  },
  "withdrawInput": {
    "coinType": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::FakeCoin<0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::ETH>",
    "sender": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa",
    "amount": 42
  },
  "transferInput": {
    "coinType": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::FakeCoin<0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa::fake_coin::ETH>",
    "from": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa",
    "to": "0x9a00e32ccf9327ee3655a07994791b06542dc379e5f88b6120ff122b0d5973fa",
    "amount": 42
  }
}

```



