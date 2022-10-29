import { WebSocket } from "ws";

export function onMarketUpdate(
  market: string,
  callback: (bid: number, ask: number) => void
) {
  const ws = new WebSocket("wss://ftx.com/ws");
  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        op: "subscribe",
        market,
        channel: "ticker",
      })
    );
  };

  let previousBid: number | undefined = undefined;
  let previousAsk: number | undefined = undefined;
  ws.onmessage = async (event) => {
    const data = JSON.parse(event.data.toString());
    if (data.type == "subscribed") {
      return;
    }

    if (data.type == "update") {
      const bid = data.data.bid;
      const ask = data.data.ask;
      if (bid != previousBid || ask != previousAsk) {
        previousBid = bid;
        previousAsk = ask;
        callback(bid, ask);
      }
    }
  };
}
