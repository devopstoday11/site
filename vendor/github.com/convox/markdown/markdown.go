package markdown

import (
	"bytes"
	"fmt"
	"regexp"

	"github.com/russross/blackfriday"
	yaml "gopkg.in/yaml.v2"
)

var (
	reDocument    = regexp.MustCompile(`(?ms)(---(.*?)---)?(.*)$`)
	reMarkdownDiv = regexp.MustCompile(`(?ms)(<div.*?markdown="1".*?>(.*?)</div>)`)
	reTag         = regexp.MustCompile(`(?ms)(<[\w]+.*?>(.*?)</[\w]+>)`)
)

type Document struct {
	Body  []byte
	Front map[string]interface{}
}

func Render(data []byte) (*Document, error) {
	d := &Document{}

	m := reDocument.FindSubmatch(data)

	if len(m) != 4 {
		return nil, fmt.Errorf("parse error: split")
	}

	front, err := parseFront(m[1])
	if err != nil {
		return nil, fmt.Errorf("parse error: front: %s", err)
	}

	d.Front = front

	body := m[3]

	// replace internal markdown divs
	for _, n := range reMarkdownDiv.FindAllSubmatch(body, -1) {
		np := blackfriday.Run(n[2],
			blackfriday.WithExtensions(blackfriday.CommonExtensions|blackfriday.AutoHeadingIDs|blackfriday.LaxHTMLBlocks),
		)

		body = bytes.Replace(body, n[2], np, -1)
	}

	// parse main body
	parsed := blackfriday.Run(body,
		blackfriday.WithExtensions(blackfriday.CommonExtensions|blackfriday.AutoHeadingIDs|blackfriday.LaxHTMLBlocks),
	)

	d.Body = parsed

	return d, nil
}

func parseFront(data []byte) (map[string]interface{}, error) {
	var front map[string]interface{}

	if err := yaml.Unmarshal(data, &front); err != nil {
		return nil, err
	}

	return front, nil
}
