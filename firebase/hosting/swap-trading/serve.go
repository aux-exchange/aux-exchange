package main

import (
	"embed"
	"flag"
	"fmt"
	"log"
	"net/http"
)

//go:embed all:charting_library
//go:embed all:assets
//go:embed charts.css config.js colors.js index.html logo.svg theme.js 404.html
var swapTradingUi embed.FS

func main() {
	var port int
	flag.IntVar(&port, "port", 5173, "port to run the static web gui on")
	var addr string
	flag.StringVar(&addr, "host", "localhost", "the server to bind to")

	flag.Parse()

	http.Handle("/", http.FileServer(http.FS(swapTradingUi)))

	serverAddr := fmt.Sprintf("%s:%d", addr, port)
	fmt.Printf("server is running at http://%s", serverAddr)

	log.Fatal(http.ListenAndServe(serverAddr, nil))
}
