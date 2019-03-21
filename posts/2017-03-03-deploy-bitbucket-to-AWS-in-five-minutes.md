---
title: Deploy Bitbucket to AWS in Five Minutes
author: Ian Malott
twitter: ianmalott
---

Most Convox users deploy apps that they develop in-house. A team of developers iterates rapidly on new features and fixes, and they deploy that code multiple times a week, if not multiple times a day. This means building images frequently. When using Convox in this fashion, it's easy to lose sight of one of the delightful benefits of an image-based platform like Convox: the ease of deploying apps _other teams_ are developing, using images that have already been built.

<!--more-->

## Deploying a pre-built app

We'd like to share an example of deploying just such an app--one with extensive and familiar functionality. With a few lines of YAML config and a couple Convox CLI commands, you can deploy [Bitbucket Server](https://www.atlassian.com/software/bitbucket/server) to a Convox Rack running in your AWS account and have it ready to demo in just a few minutes. Here's what it takes:


1. Create a new directory called 'bitbucket-server'.
2. In that directory, create a docker-compose.yml with the following contents.
    <pre>
    version: '2'
    services:
      web:
        image: atlassian/bitbucket-server
        mem_limit: 1024MB
        ports:
          - 80:7990</pre>
3. Run `convox apps create bitbucket-server` to prepare a new app.
4. Run `convox deploy` to create and promote a new release for that app.
5. Wait for the status in `convox apps` to change from _updating_ to _running_.

To visit your Bitbucket Server app, run `convox apps info bitbucket-server` and visit the URL listed next to "Endpoints." You should see a Bitbucket "starting up" screen like this:

![Bitbucket starting up screenshot](/images/blog/bitbucket-starting-up.png)

## Why was that so easy?

Had you deployed the codebase of an app instead of an image, you'd have needed more configuration, and the deployment itself would have involved a build step to create an image before running it. In this case, Atlassian has done all of the hard work by providing a ready-to-go Docker image: [atlassian/bitbucket-server](https://hub.docker.com/r/atlassian/bitbucket-server/). You simply declare the image in your docker-compose.yml, allocate an appropriate amount of memory for the app, and tell Convox to forward internet traffic on port 80 to port 7990 of the `web` service (see `EXPOSE 7990` in the image's Dockerfile).

## What if I don't have a Convox Rack?

If you haven't used Convox before, then this demo might feel out of reach. The good news is that you can set up a Rack in about 20 minutes by signing up for a Convox account at [console.convox.com](https://console.convox.com) and then following our welcome checklist. It steps you through integrating with an AWS account and installing a Rack.

If you've never run software on AWS before, this would be a great way to try it out. Convox takes care of creating dozens of resources and configuring them for a convenient experience.

If you're still hoping for a five-minute demo, you're in luck. You can get a glimpse of how powerful images can be--without an AWS account--by running Bitbucket Server locally with `convox start`. Just follow these steps:

1. [Install the Convox CLI](https://convox.com/docs/installation/).
2. Create a new directory called 'bitbucket-server'.
3. In that directory, create a docker-compose.yml with the following contents.
    <pre>
    version: '2'
    services:
      web:
        image: atlassian/bitbucket-server
        ports:
          - 80:7990</pre>
4. Run the command `convox start` and wait for the app to boot.

To interact with your BitBucket Server app, visit _http://localhost_ in your browser.

## The takeaway

This exercise is a good reminder that builds can be decoupled from deployments. It also hints at how using images can lead to more streamlined workflows, and faster, less error-prone deployments. Convox layers this functionality on top of AWS to provide an ideal pairing of convenience and power.
