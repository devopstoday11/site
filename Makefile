.PHONY: all build mocks test

commands  = web
terminals = intro
webpack   = public/assets/site.js

assets   = $(wildcard assets/*)
binaries = $(addprefix $(GOPATH)/bin/, $(commands))
compiler = go
images   = $(addsuffix .gif, $(addprefix public/images/terminals/, $(terminals)))
mode     = development
sources  = $(shell find . -name '*.go')

ifeq ($(PACKAGE),true)
	compiler=packr
	mode=production
endif

all: build

build: $(binaries) $(webpack)

images: $(images)

mocks:
	make -C models mocks
	make -C pkg/storage mocks

test:
	env TEST=true go test -coverpkg ./... -covermode atomic -coverprofile coverage.txt ./...

$(binaries): $(GOPATH)/bin/%: $(sources)
	$(compiler) install ./cmd/$*

$(GOPATH)/bin/web: $(webpack)

$(images): public/images/terminals/%.gif: assets/%.yml
	terminalizer render $< -o $@

$(webpack): $(assets)
	node webpack/node_modules/webpack/bin/webpack.js --config webpack/webpack.config.js --mode $(mode)
