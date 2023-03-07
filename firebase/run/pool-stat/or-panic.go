package main

func getOrPanic[T any](input T, err error) T {
	orPanic(err)
	return input
}

func orPanic(err error) {
	if err != nil {
		panic(err)
	}
}
