package main

import (
	"fmt"
	"html/template"
	"os"
	"time"

	"github.com/convox/site/pkg/posts"
	"github.com/convox/stdapi"
	"github.com/gobuffalo/packr"
)

var (
	Posts posts.Posts
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: %s\n", err)
		os.Exit(1)
	}
}

func run() error {
	s := stdapi.New("site", "site.convox")

	s.Router.Static("/assets", packr.NewBox("../../public/assets"))
	s.Router.Static("/images", packr.NewBox("../../public/images"))

	s.Use(handleRedirects)

	s.Route("GET", "/", page)
	s.Route("GET", "/blog", blog)
	s.Route("GET", "/blog/{slug}", post)
	s.Route("GET", "/{slug}", page)

	stdapi.LoadTemplates(packr.NewBox("../../pages"), helpers)

	s.HandleNotFound(func(c *stdapi.Context) error {
		c.Response().WriteHeader(404)
		return c.RenderTemplate("404", map[string]interface{}{"Active": ""})
	})

	ps, err := posts.Load(packr.NewBox("../../posts"))
	if err != nil {
		return err
	}

	Posts = ps

	if err := s.Listen("https", ":3000"); err != nil {
		return err
	}

	return nil
}

func helpers(c *stdapi.Context) template.FuncMap {
	return template.FuncMap{
		"body": func(data []byte) template.HTML {
			return template.HTML(string(data))
		},
		"date": func(t time.Time) string {
			return t.Format("Jan 02, 2006")
		},
		"env": func(s string) string {
			return os.Getenv(s)
		},
	}
}

func blog(c *stdapi.Context) error {
	params := map[string]interface{}{
		"Active": "blog",
		"Posts":  Posts,
	}

	return c.RenderTemplate("blog/index", params)
}

func page(c *stdapi.Context) error {
	slug := c.Var("slug")

	if slug == "" {
		slug = "index"
	}

	params := map[string]interface{}{
		"Active": slug,
	}

	if !stdapi.TemplateExists(slug) {
		c.Response().WriteHeader(404)
		return c.RenderTemplate("404", params)
	}

	return c.RenderTemplate(slug, params)
}

func post(c *stdapi.Context) error {
	p := Posts.FindSlug(c.Var("slug"))

	params := map[string]interface{}{
		"Active": "blog",
		"Post":   p,
	}

	if p == nil {
		c.Response().WriteHeader(404)
		return c.RenderTemplate("404", params)
	}

	return c.RenderTemplate("blog/post", params)
}
