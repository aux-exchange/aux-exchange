package aptos

import "net/http"

// AptosRequest
type AptosRequest interface {
	PathSegments() ([]string, error)
	Body() ([]byte, error)
	HttpMethod() string
}

// GetRequest embed this struct for a get request where only path segments are necessary.
type GetRequest struct{}

func (*GetRequest) Body() ([]byte, error) {
	return nil, nil
}

func (*GetRequest) HttpMethod() string {
	return http.MethodGet
}

// pathSegmentHolder is a get request where all requests share the same path segments
type pathSegmentHolder struct {
	Segments []string `json:"-" url:"-"`

	GetRequest
}

func (p *pathSegmentHolder) PathSegments() ([]string, error) {
	return p.Segments, nil
}

func newPathSegmentHolder(segments ...string) *pathSegmentHolder {
	return &pathSegmentHolder{
		Segments: segments,
	}
}

type AptosResponse[T any] struct {
	RawData []byte
	Parsed  *T
}
