package posts

import (
	"fmt"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/convox/markdown"
	"github.com/gobuffalo/packr"
)

var (
	reDocument    = regexp.MustCompile(`(?ms)(---(.*?)---)?(.*)$`)
	reMarkdownDiv = regexp.MustCompile(`(?ms)(<div.*?markdown="1".*?>(.*?)</div>)`)
	reSlug        = regexp.MustCompile(`^(\d+-\d+-\d+)-(.*)$`)
	reTag         = regexp.MustCompile(`(?ms)(<[\w]+.*?>(.*?)</[\w]+>)`)
)

type Post struct {
	Body  []byte
	Date  time.Time
	Slug  string
	Title string
}

type Posts []Post

func Load(box packr.Box) (Posts, error) {
	ps := Posts{}

	for _, post := range box.List() {
		p, err := loadPost(post, box.Bytes(post))
		if err != nil {
			return Posts{}, err
		}

		ps = append(ps, *p)
	}

	sort.Slice(ps, func(i, j int) bool { return ps[i].Date.After(ps[j].Date) })

	return ps, nil
}

func (ps Posts) FindSlug(slug string) *Post {
	for _, p := range ps {
		if p.Slug == slug {
			return &p
		}
	}

	return nil
}

func loadPost(name string, data []byte) (*Post, error) {
	p := &Post{}

	base := strings.TrimSuffix(name, ".md")
	slug := strings.Replace(base, ".", "-", -1)

	ms := reSlug.FindStringSubmatch(slug)

	if len(ms) != 3 {
		return nil, fmt.Errorf("could not parse slug: %s", slug)
	}

	t, err := time.Parse("2006-01-02", ms[1])
	if err != nil {
		return nil, err
	}

	p.Date = t
	p.Slug = ms[2]

	d, err := markdown.Render(data)
	if err != nil {
		return nil, err
	}

	p.Body = d.Body

	if t, ok := d.Front["title"].(string); ok {
		p.Title = t
	}

	return p, nil

	// data, err := ioutil.ReadAll(file)
	// if err != nil {
	//   return nil, err
	// }

	// m := reDocument.FindSubmatch(data)

	// if len(m) != 4 {
	//   return nil, fmt.Errorf("could not parse front matter")
	// }

	// var front map[string]string

	// if err := yaml.Unmarshal(m[1], &front); err != nil {
	//   return err
	// }

	// d.Description = front["description"]
	// d.Title = front["title"]

	// if d.Title == "" {
	//   d.Title = name
	// }

	// d.Order = 50000

	// if os, ok := front["order"]; ok {
	//   o, err := strconv.Atoi(os)
	//   if err != nil {
	//     return err
	//   }
	//   d.Order = o
	// }

	// d.Tags = []string{}

	// for _, t := range strings.Split(front["tags"], ",") {
	//   if tt := strings.TrimSpace(t); tt != "" {
	//     d.Tags = append(d.Tags, tt)
	//   }
	// }

	// sort.Strings(d.Tags)

	// markdown := m[3]

	// for _, n := range reMarkdownDiv.FindAllSubmatch(markdown, -1) {
	//   np := blackfriday.Run(n[2],
	//     blackfriday.WithExtensions(blackfriday.CommonExtensions|blackfriday.AutoHeadingIDs|blackfriday.LaxHTMLBlocks),
	//   )

	//   markdown = bytes.Replace(markdown, n[2], np, -1)
	// }

	// parsed := blackfriday.Run(markdown,
	//   blackfriday.WithExtensions(blackfriday.CommonExtensions|blackfriday.AutoHeadingIDs|blackfriday.LaxHTMLBlocks),
	// )

	// d.Body = parsed

	// c.Documents = append(c.Documents, d)

	// documents = append(documents, d)

	// return nil
}
