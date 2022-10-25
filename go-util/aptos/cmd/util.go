package cmd

import (
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"

	"github.com/aux-exchange/aux-exchange/go-util/aptos"
	"github.com/aux-exchange/aux-exchange/go-util/aptos/known"
	"github.com/mattn/go-isatty"
)

func getOrPanic[T any](v T, err error) T {
	orPanic(err)

	return v
}

func orPanic(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

type warnPrinter struct {
	colorRed   string
	colorReset string
}

func newWarnPrinter() *warnPrinter {
	colorRed := ""
	colorReset := ""
	if isatty.IsTerminal(os.Stdin.Fd()) {
		colorReset = "\033[0m"
		colorRed = "\033[31m"
	}

	return &warnPrinter{
		colorRed:   colorRed,
		colorReset: colorReset,
	}
}

var redWarn = newWarnPrinter()

func (rw *warnPrinter) Printf(format string, a ...any) {
	s := fmt.Sprintf(format, a...)
	fmt.Printf("%s%s%s", redWarn.colorRed, s, redWarn.colorReset)
}

func checkAccountExist(restUrl, account string) bool {
	pathToCheck := getOrPanic(url.JoinPath(restUrl, "accounts", account))
	res, err := http.Get(pathToCheck)
	if err != nil {
		return false
	}

	defer res.Body.Close()

	return res.StatusCode < 400
}

func parseCoinType(network aptos.Network, coinType string) (*aptos.MoveTypeTag, error) {
	coinInfo := known.GetCoinInfoBySymbol(network, coinType)
	if coinInfo != nil {
		return coinInfo.TokenType.Type, nil
	}

	coin, err := aptos.ParseMoveTypeTag(coinType)
	if err != nil {
		return nil, fmt.Errorf("cannot find %s on aptos %s as a known coin, and failed to parse as a move type: %w", coinType, network, err)
	}

	return coin, nil
}
