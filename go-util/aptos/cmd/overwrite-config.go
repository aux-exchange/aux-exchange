package cmd

import (
	"fmt"
	"os"
	"time"

	"github.com/aux-exchange/aux-exchange/go-util/aptos"
)

func IsFileExists(fileName string) bool {
	_, err := os.Stat(fileName)
	return !os.IsNotExist(err)
}

func OverwriteConfig(configs *aptos.ConfigFile, configFile string) {
	if _, err := os.Stat(configFile); !os.IsNotExist(err) {
		timestr := time.Now().Format("2006-01-02-H-15-04-05-999999999")
		backName := fmt.Sprintf("%s.backup.%s", configFile, timestr)
		fmt.Printf("backup config at %s\n", backName)
		orPanic(os.Rename(configFile, backName))
	}
	os.WriteFile(configFile, getOrPanic(configs.ToString()), 0o666)
}
