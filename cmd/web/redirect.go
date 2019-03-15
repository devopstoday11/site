package main

import "github.com/convox/stdapi"

var redirects = map[string]string{
	"/cli/linux/convox":       "https://convox.s3.amazonaws.com/cli/linux/convox",
	"/cli/macos/convox":       "https://convox.s3.amazonaws.com/cli/darwin/convox",
	"/cli/osx/convox":         "https://convox.s3.amazonaws.com/cli/darwin/convox",
	"/cli/windows/convox.exe": "https://convox.s3.amazonaws.com/cli/windows/convox.exe",
	"/guide/heroku":           "https://docs.convox.com/migration/heroku",
	"/k8s":                    "https://goo.gl/forms/3n0ejrzPgr7WkIU92",
	"/kubernetes":             "https://goo.gl/forms/3n0ejrzPgr7WkIU92",
	"/legal/privacy":          "/privacy",
	"/legal/terms":            "/terms",
}

func handleRedirects(fn stdapi.HandlerFunc) stdapi.HandlerFunc {
	return func(c *stdapi.Context) error {
		if t, ok := redirects[c.Request().URL.Path]; ok {
			return c.Redirect(301, t)
		}

		return fn(c)
	}
}
