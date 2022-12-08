import { Kafka } from "kafkajs";
import _ from "lodash";

import { AuxClient } from "../client";
import { APT, USDC_ETH_WH } from "../coin";
import { AuxEnv } from "../env";
import { PoolClient } from "../pool/client";
import { parseRawSwapEvent } from "../pool/schema";

async function main() {
  const kafka = new Kafka({
    clientId: "aux-indexer",
    brokers: ["localhost:9092"],
  });
  const producer = kafka.producer();
  await producer.connect();

  const auxEnv = new AuxEnv();
  const auxClient = new AuxClient(auxEnv.aptosNetwork, auxEnv.aptosClient);
  const poolClient = new PoolClient(auxClient, {
    coinTypeX: APT,
    coinTypeY: USDC_ETH_WH,
  });

  let start = 0;
  do {
    const events = await auxClient.aptosClient.getEventsByEventHandle(
      auxClient.moduleAddress,
      poolClient.type,
      "swap_events",
      {
        start,
        limit: 100,
      }
    );
    const eventsDU = await Promise.all(
      events
        // @ts-ignore
        .map(parseRawSwapEvent)
        .map(
          async ({
            kind,
            type,
            sequenceNumber,
            timestamp,
            senderAddr,
            coinTypeIn,
            coinTypeOut,
            amountIn,
            amountOut,
            feeBps,
            reserveIn,
            reserveOut,
          }) => ({
            kind,
            poolType: type,
            sequenceNumber: sequenceNumber.toNumber(),
            timestamp: timestamp.toNumber(),
            sender: senderAddr.hex(),
            coinTypeIn,
            coinTypeOut,
            amountIn: amountIn
              .toDecimalUnits(
                (
                  await auxClient.getCoinInfo(coinTypeIn)
                ).decimals
              )
              .toNumber(),
            amountOut: amountOut
              .toDecimalUnits(
                (
                  await auxClient.getCoinInfo(coinTypeOut)
                ).decimals
              )
              .toNumber(),
            feeBps,
            reserveIn: reserveIn
              .toDecimalUnits(
                (
                  await auxClient.getCoinInfo(coinTypeIn)
                ).decimals
              )
              .toNumber(),
            reserveOut: reserveOut
              .toDecimalUnits(
                (
                  await auxClient.getCoinInfo(coinTypeOut)
                ).decimals
              )
              .toNumber(),
          })
        )
    );
    await producer.send({
      topic: "raw-swaps",
      messages: events.map((event) => ({
        key: poolClient.type,
        value: JSON.stringify(event),
      })),
    });
    await producer.send({
      topic: "swaps",
      messages: eventsDU.map((event) => ({
        key: poolClient.type,
        value: JSON.stringify(event),
      })),
    });
    if (_.isEmpty(eventsDU)) {
      break;
    }
    start = Number(eventsDU[eventsDU.length - 1]!.sequenceNumber);
    console.log(start);
    await new Promise(r => setTimeout(r, 500))
  } while (start < 125791);

  producer.disconnect();
}

main();
