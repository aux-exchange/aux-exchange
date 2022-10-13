import asyncio
import json
import websockets


async def hello():
    with open("coinbase.json", "w") as f:
        async with websockets.connect(
            "wss://ws-feed.exchange.coinbase.com", ssl=True
        ) as websocket:
            await websocket.send(
                json.dumps(
                    {
                        "type": "subscribe",
                        "product_ids": ["ETH-USD"],
                        "channels": ["full", "matches", "heartbeat"],
                    }
                )
            )
            while True:
                print(await websocket.recv(), file=f)


asyncio.run(hello())
