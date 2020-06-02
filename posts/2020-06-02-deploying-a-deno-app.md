---
title: Deploying a Deno App on Any Cloud with Convox
author: Cameron Gray
twitter: camerondgray
tags: [Convox, deno, AWS, GCP, Digital Ocean, Kubernetes]
description: Deploying a deno app on any cloud is easy with Convox
---

[Deno](https://deno.land/) is that newest kid on the JavaScript/TypeScript block. It's a simple and lightweight runtime that uses the V8 Engine, is written in Rust, and it's creation was spearheaded by [Ryan Dahl](https://github.com/ry) of NodeJS fame. Deno just hit its [1.0 milestone](https://deno.land/v1) and we thought it would be a good time to start playing around with shipping Deno apps. Since Convox is language agnostic and multi-cloud we are all about shipping any app, written in any language, to any cloud. So let's get started and ship our first Deno app!

## Install Deno

Follow the instructions [here](https://deno.land/manual/getting_started/installation) for your operating system. I am on a Mac so I chose to use Homebrew.

```
$ brew install deno
```

## Create a simple Hello World Web app

### hello.ts

```
import { serve } from "https://deno.land/std@v0.54.0/http/server.ts";

const hostname = "0.0.0.0";
const port = 8080;
const s = serve({ port: port});

const body = new TextEncoder().encode("Hello World\n");
console.log(`Listening on ${hostname}:${port}`);

for await ( const req of s) {
  req.respond({ body });
}
```

This very simple app creates a web server listening on port 8080 and responds to all requests with "Hello World".

We can test our app by running:

`$ deno run --allow-net hello.ts`

and then opening another terminal window and running:

```
$ curl http://localhost:8080
Hello World
```

## Create a Dockerfile

All apps deployed on Convox run in containers and therefore need a Dockerfile. Deno does not currently have an [official Dockerfile](https://github.com/denoland/deno/issues/3356) but [this](https://github.com/hayd/deno-docker/) seems to be a very popular and well constructed Dockerfile so we will use that as our base.

### A little caching cleanup

The first thing we will do is cleanup our dependencies for better maintainability and caching. Let's create a dependencies file `deps.ts` and put our single dependency in it.

### deps.ts

```
export { serve } from "https://deno.land/std@0.54.0/http/server.ts";
```

Then we can tweak our `hello.ts` file a little bit

```
import { serve } from "./deps.ts";
const hostname = "0.0.0.0";
const port = 8080;
const s = serve({ port: port});

const body = new TextEncoder().encode("Hello World\n");
console.log(`Listening on ${hostname}:${port}`);

for await ( const req of s) {
  req.respond({ body });
}
```

### The Dockerfile

Finally following the very nice [example](https://github.com/hayd/deno-docker) from [Andy Hayden](https://github.com/hayd) we can create our Dockerfile.

```
FROM hayd/ubuntu-deno

EXPOSE 8080

WORKDIR /app

USER deno

COPY deps.ts .
RUN deno cache deps.ts

ADD . .

RUN deno cache hello.ts

CMD ["run", "--allow-net", "hello.ts"]
```

## Create a convox.yml

In order to deploy our new app to a [Convox Rack](https://docs.convox.com/reference/primitives/rack) we need to first create a [convox.yml](https://docs.convox.com/configuration/convox-yml) manifest file. In the case of this very simple app we have a very simple manifest.

### convox.yml

```
services:
  app:
    build: .
    port: 8080
```

We define a service called `app` which is built from the Dockerfile in the current directory and exposes the internal port of 8080.

### (optional) Test Locally

If you have a [local Rack](https://docs.convox.com/installation/development-rack) installed you can test your app by running `convox start` and then opening a browser and going to [`https://app.deno.dev.convox/`](https://app.deno.dev.convox/) where you should see your "Hello World" message.

## Deploy Your App

If you have not yet installed a [production Rack](https://docs.convox.com/installation/production-rack) you can do so easily for the cloud of your choice in just a few minutes using either the [Convox web console](https://docs.convox.com/getting-started/introduction) or the [Convox CLI](https://docs.convox.com/installation/production-rack)

Once you have a production Rack up and running all you need to do is create an empty app and deploy. For this example I have a Rack running on Digital Ocean called `do-test`.

```
$ convox racks
NAME               PROVIDER  STATUS
do-test            do        running
```

First I switch to my Rack and create an empty app

```
$ convox switch do-test
Switched to do-test
$ convox apps create
Creating deno... OK
```

My current directory is called `deno` and Convox automatically assumes your app name matches the current directory name unless you pass the `--app` argument to app related commands.

Now that I have an empty app created I can deploy my app with `convox deploy`

```
$ convox deploy
Packaging source... OK
Uploading source... OK
Starting build... OK
Authenticating registry.05456db021737ab6.convox.cloud/deno: Login Succeeded
Building: .
Sending build context to Docker daemon   5.12kB
Step 1/9 : FROM hayd/ubuntu-deno
 ---> 46fa88c6e582
Step 2/9 : EXPOSE 8080
 ---> Using cache
 ---> 8558dbd2cc9a
Step 3/9 : WORKDIR /app
 ---> Using cache
 ---> 9b090a2faa85
Step 4/9 : USER deno
 ---> Using cache
 ---> e89528aa5d35
Step 5/9 : COPY deps.ts .
 ---> Using cache
 ---> 3d81ce45b513
Step 6/9 : RUN deno cache deps.ts
 ---> Using cache
 ---> e8d9b94708ad
Step 7/9 : ADD . .
 ---> Using cache
 ---> 0d9374c31e7e
Step 8/9 : RUN deno cache hello.ts
 ---> Using cache
 ---> 3aad783eeb21
Step 9/9 : CMD ["run", "--allow-net", "hello.ts"]
 ---> Using cache
 ---> 4721697b19de
Successfully built 4721697b19de
Successfully tagged adc456a75a24f6940a7c04f27deca0a69aa82ce436aac812f5dc784c:latest
Running: docker tag adc456a75a24f6940a7c04f27deca0a69aa82ce436aac812f5dc784c do-test/deno:app.BMPHETIBKJY
Running: docker tag do-test/deno:app.BMPHETIBKJY registry.05456db021737ab6.convox.cloud/deno:app.BMPHETIBKJY
Running: docker push registry.05456db021737ab6.convox.cloud/deno:app.BMPHETIBKJY

Promoting RLCBFEFTRIP... 
2020-05-29T23:12:52Z system/k8s/atom/app Status: Running => Pending
2020-05-29T23:12:53Z system/k8s/app Scaled up replica set app-bd9774756 to 1
2020-05-29T23:12:53Z system/k8s/app-bd9774756 Created pod: app-bd9774756-gpnnj
2020-05-29T23:12:53Z system/k8s/app-bd9774756-gpnnj Successfully assigned do-test-deno/app-bd9774756-gpnnj to do-test-node-3n6m6
2020-05-29T23:12:55Z system/k8s/app-bd9774756-gpnnj Created container main
2020-05-29T23:12:55Z system/k8s/app-bd9774756-gpnnj Started container main
2020-05-29T23:12:55Z system/k8s/app-bd9774756-gpnnj Container image "registry.05456db021737ab6.convox.cloud/deno:app.BMPHETIBKJY" already present on machine
2020-05-29T23:12:56Z system/k8s/atom/app Status: Pending => Updating
2020-05-29T23:13:04Z system/k8s/atom/app Status: Updating => Running
OK
$
```

The deployment time depends on the cloud your are deploying to and few other factors, such as your upload bandwidth, but typically for an app this small a first time deployment can take 1-5 minutes and subsequent deployments can take less than a minute.

## Test Your App

Now that we have deployed we can test our app by grabbing the auto-generated URL with `convox services`

```jsx
$ convox services
SERVICE  DOMAIN                                  PORTS
app      app.deno.05456db021737ab6.convox.cloud  443:8080
```

And we can test with either `curl` or our browser

```jsx
$ curl https://app.deno.05456db021737ab6.convox.cloud 
Hello World
```

And just like that we have a Deno app up and running on Digital Ocean with a valid SSL certificate and we can make updates and redeploy with a single command! You can find the example app for this post in the [Convox-Examples Github Repository](https://github.com/convox-examples/deno).

## Next Steps

- Use a [custom domain](https://docs.convox.com/deployment/custom-domains)
- Add a [database resource](https://docs.convox.com/reference/primitives/app/resource)
- Test [deploying changes and rolling back](https://docs.convox.com/deployment/deploying-changes)
- Create a [review workflow](https://console-docs.convox.com/console/workflows#review-workflows) or [deployment workflow](https://console-docs.convox.com/console/workflows#deployment-workflows) to deploy directly from Github
