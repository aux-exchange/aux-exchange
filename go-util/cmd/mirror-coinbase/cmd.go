package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/gorilla/websocket"
	"github.com/spf13/cobra"
)

func main() {
	cmd := &cobra.Command{
		Use:   "mirror-coinbase",
		Short: "mirror data from coinbase websocket",
		Args:  cobra.NoArgs,
	}

	endpoint := "wss://ws-feed.exchange.coinbase.com"
	outputFile := "output.json"
	asset := "ETH-USD"

	cmd.Flags().StringVarP(&endpoint, "endpoint", "u", endpoint, "endpoint for coinbase websocket")
	cmd.Flags().StringVarP(&outputFile, "output-file", "o", outputFile, "output file name")
	cmd.Flags().StringVarP(&asset, "asset", "a", asset, "asset")

	cmd.Run = func(_ *cobra.Command, _ []string) {
		dialer := websocket.Dialer{
			Proxy:            http.ProxyFromEnvironment,
			HandshakeTimeout: 60 * time.Second,
		}

		ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT)
		defer cancel()

		conn, rsp, err := dialer.DialContext(ctx, endpoint, nil)
		if err != nil {
			panic(fmt.Errorf("failed to open connection: %v %#v", err, rsp))
		}

		defer conn.Close()

		if err := conn.WriteJSON(map[string]any{
			"type":        "subscribe",
			"product_ids": []string{strings.ToUpper(asset)},
			"channels":    []string{"full", "matches", "heartbeat"},
		}); err != nil {
			panic(err)
		}

		var wg sync.WaitGroup
		defer wg.Wait()

		wg.Add(1)

		output, err := os.OpenFile(outputFile, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0o666)
		if err != nil {
			panic(err)
		}

		defer output.Close()

		waiter := make(chan struct{})
		go func() {
			defer wg.Done()
			defer func() {
				waiter <- struct{}{}
				close(waiter)
			}()
			for {
				_, data, err := conn.ReadMessage()
				if err != nil {
					break
				}

				fmt.Fprintln(output, string(data))
			}
		}()

		select {
		case <-waiter:
		case <-ctx.Done():
			msg, err := json.Marshal(map[string]any{
				"type":     "unsubcribe",
				"channels": []string{"full", "matches", "heartbeat"},
			})
			if err != nil {
				panic(err)
			}

			conn.WriteControl(websocket.CloseMessage, msg, time.Now().Add(time.Second*2))
			conn.Close()
			<-waiter
		}
	}

	cmd.Execute()
}
