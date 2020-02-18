---
title: Deploy to Any Cloud with Github Actions
author: Cameron Gray
twitter: camerondgray
tags: [Github Actions, Convox, ECS, EKS, Google Cloud, GCP, Digital Ocean, Kubernetes, CI, CD, Continuous Deployment]
description: Introducing a complete set of Github Actions from Convox allowing you to easily to deploy to AWS, Google Cloud, or Digital Ocean
---

Today we are pleased to announce the official release of our [Convox Github Actions](https://github.com/marketplace/actions/convox-deploy). With these actions you can easily create a fully-featured CI/CD pipeline for the cloud of your choice. All you need to do is [install a Convox Rack](https://github.com/convox/installer) for a cloud provider, and create a [convox.yml](https://docsv2.convox.com/application/convox-yml) to describe your app and you will be ready to start deploying. For a basic primer on how Github Actions work you can read more [here](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/getting-started-with-github-actions).

The set of actions we have created should be everything you need to build, deploy, and manage your app. They can be combined to enable a wide variety of workflows. These actions work on all Convox Racks on AWS(ECS or EKS), Google Cloud, Digital Ocean, and more to come. The actions are as follows:
## Actions
### [Login](https://github.com/convox/action-login)
This action authenticates your [Convox Account](https://console.convox.com/signup) and sets login credentials for all subsequent actions.

### [Build](https://github.com/convox/action-build)
This action [builds](https://docsv2.convox.com/deployment/builds) your Dockerfile and processes your convox.yml to create a promotable Convox release. 

### [Run](https://github.com/convox/action-run)
This action [runs a command](https://docsv2.convox.com/management/one-off-commands) using a previously built release either before or after it’s promoted in your Convox Rack. This action is very handy for things like running migrations before promoting or running a cleanup or notification command after promoting.

### [Promote](https://github.com/convox/action-promote)
This action [promotes a release](https://docsv2.convox.com/deployment/releases#promoting-a-release) and performs a rolling deploy of your application. 

### [Deploy](https://github.com/convox/action-deploy)
This action performs the build and promote steps in a single action. You can use this when you don’t need to run migrations or perform any other steps between building and promoting.

## Building a Deployment Workflow with Convox Github Actions 
Let’s take the scenario where we have a [Rails app](https://github.com/convox-examples/rails) and we want to build it, run migrations, and then promote on our staging Rack. The first thing we will need to do is grab our [Convox Deploy Key](https://docsv2.convox.com/console/deploy-keys) and create a [Github encrypted secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets) called `CONVOX_DEPLOY_KEY` with its value. Now all we need to do is create a `.github/workflows/deploy.yml` in our repo that looks something like:
```
name: CD
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: checkout
      id: checkout
      uses: actions/checkout@v1
    - name: login
      id: login
      uses: convox/action-login@v1
      with:
        password: ${{ secrets.CONVOX_DEPLOY_KEY }}
    - name: build
      id: build
      uses: convox/action-build@v1
      with:
        rack: staging
        app: myrailsapp
    - name: migrate
      id:migrate
      uses: convox/action-run@v1
      with:
        rack: staging
        app: myrailsapp
        service: web
        command: rake db:migrate
        release: ${{ steps.build.outputs.release }}
    - name: promote
      id: promote
      uses: convox/action-promote@v1
      with:
        rack: staging
        app: myrailsapp
        release: ${{ steps.build.outputs.release }}
```
Looking through this example we can see it’s fairly simple. The steps are

* `checkout` - Uses the [Github Checkout Action](https://github.com/actions/checkout) to grab the latest code
* `login` - Uses our stored secret deploy key with the [login action]((#loginhttpsgithubcomconvoxaction-login)) to authenticate our Convox account
* `build` - Builds our app using the [build](#buildhttpsgithubcomconvoxaction-build) action creating a release
* `migrate` - Runs our migrations with a [run action](#runhttpsgithubcomconvoxaction-run) using the new release 
* `promote` - Promotes our new release using the [promote action](#promotehttpsgithubcomconvoxaction-promote) with a zero-downtime rolling deploy

You can find our actions in the [Github Marketplace](https://github.com/marketplace/actions/convox-deploy) or in our [Github Actions Repository](https://github.com/convox/actions). You can combine these actions to create all sorts of interesting workflows. We can’t wait to see what you build with them! Please share the cool workflows you build with us on our [community forum](https://community.convox.com).

