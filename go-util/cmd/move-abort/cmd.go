package main

import (
	"fmt"
	"io/fs"
	"os"
	"path"
	"regexp"
	"strings"

	"github.com/spf13/cobra"
)

const longDescription = `add assert!(1==2, E_EMERGENCY_ABORT) to all move public functions.

Several restrictions on how to write the move code:

- there cannot be "use" inside the function body.
- function must line break after opening bracket "{".

The function that is used to retrieve signer should not be marked (exclude that file with -e or --ignore-files option).
For example, the function "aux::authority::get_signer" should be always abort.
`

func main() {
	cmd := &cobra.Command{
		Use:   "move-abort",
		Short: "add `assert!(1==2, E_EMERGENCY_ABORT)` to all move public functions",
		Args:  cobra.NoArgs,
		Long:  longDescription,
	}

	fromDir := "aptos/contract/aux/sources"
	toDir := "aptos/abort-only-contract/aux/sources"
	ignoreFiles := []string{}

	cmd.Flags().StringVarP(&fromDir, "from-dir", "i", fromDir, "from directory, where move codes are located")
	cmd.Flags().StringVarP(&toDir, "to-dir", "o", toDir, "to directory, where abort only contracts are generated")
	cmd.Flags().StringArrayVarP(&ignoreFiles, "ignore-files", "e", ignoreFiles, "move source file to ignore.")

	cmd.MarkFlagDirname(fromDir)
	cmd.MarkFlagDirname(toDir)

	cmd.Run = func(_ *cobra.Command, _ []string) {
		Process(fromDir, toDir, ignoreFiles)
	}

	cmd.Execute()
}

func getOrPanic[T any](in T, err error) T {
	if err != nil {
		panic(err)
	}

	return in
}

func getAllFiles(files []fs.DirEntry) []string {
	result := []string{}
	for _, f := range files {
		if f.IsDir() {
			continue
		}

		result = append(result, f.Name())
	}

	return result
}

func isFileIgnored(ignoreFiles []string, file string) bool {
	for _, v := range ignoreFiles {
		if v == file {
			return true
		}
	}

	return false
}

func Process(fromDir string, toDir string, ignoreFiles []string) {
	files := getAllFiles(getOrPanic(os.ReadDir(fromDir)))

	for _, f := range files {
		codeFile := getOrPanic(os.ReadFile(path.Join(fromDir, f)))
		modifiedCodeFile := ""
		switch {
		case !strings.HasSuffix(f, ".move"):
			modifiedCodeFile = string(codeFile)
		case isFileIgnored(ignoreFiles, f):
			modifiedCodeFile = string(codeFile)
		default:
			modifiedCodeFile = ProcessFile(string(codeFile))
		}

		os.WriteFile(path.Join(toDir, f), []byte(modifiedCodeFile), 0o666)
	}
}

type ReplacerState int

const (
	BeforeModule ReplacerState = iota
	ModuleInit
	NextFun
	FunBegin
)

func TrimWhiteSpaces(line string) string {
	return strings.Trim(line, "\t\n\f\r ")
}

func IsComment(line string) bool {
	return strings.HasPrefix(TrimWhiteSpaces(line), "//")
}

func RemoveComments(line string) string {
	sublists := strings.Split(line, "//")
	return sublists[0]
}

const (
	EmergenceDefine = `    const E_EMERGENCY_ABORT: u64 = 0xFFFFFF;
    fun is_not_emergency(): bool {
        false
    }`
	AbortLine = "        assert!(is_not_emergency(), E_EMERGENCY_ABORT);"
)

var whitespaceRegex = regexp.MustCompile(`\s+`)

func MakeCanonicalLine(line string) string {
	return whitespaceRegex.ReplaceAllString(
		TrimWhiteSpaces(
			RemoveComments(
				TrimWhiteSpaces(line))), " ")
}

func ProcessFile(file string) string {
	sb := &strings.Builder{}
	lines := strings.Split(file, "\n")

	state := BeforeModule

looper:
	for _, line := range lines {
		fmt.Fprintln(sb, line)
		if IsComment(line) {
			continue looper
		}

		strippedLine := MakeCanonicalLine(line)
	stateSwitcher:
		switch state {
		case BeforeModule:
			if strings.HasPrefix(strippedLine, "module ") {
				if strings.Contains(strippedLine, "{") {
					fmt.Fprintln(sb, EmergenceDefine)
					state = NextFun
				} else {
					state = ModuleInit
				}
			}

			break stateSwitcher
		case ModuleInit:
			if strings.Contains(line, "{") {
				fmt.Fprintln(sb, EmergenceDefine)
				state = NextFun
			}
			break stateSwitcher
		case NextFun:
			if strings.HasPrefix(strippedLine, "public") &&
				!strings.HasPrefix(strippedLine, "public (friend)") &&
				!strings.HasPrefix(strippedLine, "public(friend)") {
				if strings.Contains(strippedLine, "{") {
					fmt.Fprintln(sb, AbortLine)
				} else {
					state = FunBegin
				}
			} else if strings.HasPrefix(strippedLine, "fun init_module") {
				if strings.Contains(strippedLine, "{") {
					fmt.Fprintln(sb, `        if (1 == 1) {
            return
        };`)
				} else {
					panic(fmt.Errorf("fun init_module must open on the same line"))
				}
			}
			break stateSwitcher
		case FunBegin:
			if strings.Contains(strippedLine, "{") {
				fmt.Fprintln(sb, AbortLine)
				state = NextFun
			}
			break stateSwitcher
		}
	}

	return sb.String()
}
