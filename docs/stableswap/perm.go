package stableswap

// See here https://stackoverflow.com/a/30230552

func nextPerm(p []int) {
	for i := len(p) - 1; i >= 0; i-- {
		if i == 0 || p[i] < len(p)-i-1 {
			p[i]++
			return
		}

		p[i] = 0
	}
}

func getPerm[T any](orig []T, p []int) []T {
	result := append([]T{}, orig...)

	for i, v := range p {
		result[i], result[i+v] = result[i+v], result[i]
	}

	return result
}

func getAllPerms[T any](orig []T) [][]T {
	result := make([][]T, 0)
	for p := make([]int, len(orig)); p[0] < len(p); nextPerm(p) {
		result = append(result, getPerm(orig, p))
	}

	return result
}
