---
title: Building a Github Action to Deploy to ECS and EKS
author: Cameron Gray
twitter: camerondgray
tags: [Github actions, Convox, ECS, EKS, CI, CD]
description: We build our first Github action to deploy an app onto ECS or EKS
---

The newest kid on the CI/CD block is [Github Actions](https://github.com/features/actions). As soon as the Github Actions beta was announced we knew it was something we wanted to play with. Now that Github Actions are a bit more mature and stable we figured it was time to publish something that the rest of the Convox community can use. We also thought it might be informative to explain a little bit about what we learned along the way building our first action.

The first thing you need to know is that as of the time we are publishing this post, Github Actions are not generally available and you will need to [sign up for the Beta](https://github.com/features/actions) to gain access. Github does seem to be opening up the beta fairly broadly at the moment though so you shouldn’t have too much trouble getting in. The second thing to keep in mind is that Github Actions have had a fairly significant overhaul since the initial version was released. When reading documentation, or working on your action, you will want to make sure you are working with the .YAML syntax version and not the legacy .HCL syntax version.

The core unit of Github Actions is a workflow. A workflow is repeatable process that is made up of one or more jobs. A job is in turn a set of steps that is run in a specific instance of a virtual environment.  Steps are made up of specific actions which are the smallest structures that can be defined to perform a specific task.

To keep things simple we will focus on a single Job workflow. For the workflow you need to define two things. The first is an `on` event. This is the trigger event which will either be some Github event (ie: pushing a specific branch) or a schedule (ie: daily at 05:00 UTC). The second requirement is at least one job that the workflow will execute.

For a Job you also need to define two things. The first is `runs-on` which defines the type of virtual machine required to execute this job. The second is at least one step to run as part of that job.

For a step you will need to define at least one Action or Command. An action is a piece of reusable code defined in either a Javascript File or a Docker Container. A command is any shell command that can be executed in one of the available shells for the specified Virtual Environment.

For our example we have a simple node.js app that we want to build and deploy to our Convox Rack running on ECS every time there is a new push. Because Convox supports [Deploy Keys](https://docs.convox.com/console/deploy-keys) it's relatively simple to deploy an app to a Convox Rack running on either ECS or EKS from almost any CI/CD platform including Github Actions. In order to do this we will need a Linux virtual machine to execute the following steps:

1. Checkout the latest version of the branch

2. [Install the Convox CLI](https://docs.convox.com/introduction/installation)

3. Build and Deploy our application to our specific Rack using our secret deploy key

To build this into our workflow we can simply add a `main.yml` file to the `/github/workflows` directory in our repository that looks like:

```
name: CI
on:
  push:
    branches:    
      - master
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v1
    - name: Install Convox CLI
      run: |
        curl -L https://convox.com/cli/linux/convox -o /tmp/convox
        sudo mv /tmp/convox /usr/local/bin/convox
        sudo chmod 755 /usr/local/bin/convox
    - name: Deploy
      env:
        CONVOX_PASSWORD: ${{ secrets.CONVOX_DEPLOY_KEY }}
        CONVOX_HOST: console.convox.com
        CONVOX_RACK: cgdemo/prod-demo
        APP: nodedemo
      run: convox deploy --app=$APP
```

Looking through this we are kicking our workflow off with the “push” event. In this case we are filtering on pushes to the master branch but you can also specify a tag or a file path pattern. Our job runs on the latest ubuntu virtual environment which gives us all the tools we need. We have three steps defined.

1. “Checkout” which uses the reusable [actions/checkout@v1 Action](https://github.com/actions/checkout) created and maintained by Github.

2. “Install Convox CLI” which runs a set of bash commands to install the Convox CLI in the virtual environment following our [standard Linux installation steps](https://docs.convox.com/introduction/installation#linux).

3. “Deploy” which runs the Convox deploy command passing in the required environment variables so the deploy command has everything it needs.

Actions support Input Variables, Environment Variables, and Secrets all of which will be injected as Environment Variables into the container running the action.

With this action added to the `/github/workflows` folder of your repository your application will automatically deploy itself to Convox every time you push to master. We have also created our own [reusable Github Action](https://github.com/convox/actions) which you can incorporate into your own Github Action workflows. We are just scratching the surface on what's possible with Github Actions so stay tuned for future posts as we dig deeper into this powerful set of tools.
